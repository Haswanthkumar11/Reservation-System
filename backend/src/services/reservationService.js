const mongoose = require('mongoose');
const tableRepository = require('../repositories/tableRepository');
const reservationRepository = require('../repositories/reservationRepository');
const notificationService = require('./notificationService');
const ApiError = require('../utils/ApiError');

// YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
// HH:mm (24h)
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateReservationInput({ reservationDate, timeSlot, guestCount }) {
  if (!reservationDate || !DATE_REGEX.test(reservationDate)) {
    throw new ApiError(422, 'reservationDate must be in YYYY-MM-DD format');
  }
  if (!timeSlot || !TIME_REGEX.test(timeSlot)) {
    throw new ApiError(422, 'timeSlot must be in HH:mm 24-hour format');
  }
  if (!guestCount || guestCount <= 0) {
    throw new ApiError(422, 'guestCount must be a positive number');
  }

  const requestedDateTime = new Date(`${reservationDate}T${timeSlot}:00`);
  if (Number.isNaN(requestedDateTime.getTime())) {
    throw new ApiError(422, 'Invalid reservationDate/timeSlot combination');
  }
  if (requestedDateTime.getTime() < Date.now()) {
    throw new ApiError(422, 'Reservation date/time must be in the future');
  }
}

// Search across populated customer/table fields + direct reservation fields.
// Kept in-memory (post-populate) since dataset sizes here don't warrant an
// aggregation pipeline; swap for a $lookup-based query if volume grows.
function applyReservationFilters(reservations, { status, timeSlot, search }) {
  let result = reservations;
  if (status) result = result.filter((r) => r.status === status);
  if (timeSlot) result = result.filter((r) => r.timeSlot === timeSlot);
  if (search) {
    const q = search.trim().toLowerCase();
    result = result.filter((r) =>
      [
        r.customer?.name,
        r.customer?.email,
        r.table?.tableNumber,
        r.reservationDate,
        r.timeSlot,
        r.status,
        String(r._id),
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }
  return result;
}

const reservationService = {
  /**
   * Core allocation algorithm:
   * 1. Find all active tables with capacity >= guestCount, sorted smallest-first.
   * 2. Walk the list, and for each candidate table check for a conflicting
   *    confirmed reservation at the same date+timeSlot.
   * 3. First table with no conflict is assigned. If none found -> 409.
   *
   * Wrapped in a MongoDB transaction (session) so the "check conflict then
   * save" sequence is atomic and can't race with a concurrent booking for
   * the same table/date/time.
   */
  async createReservation(customerId, { reservationDate, timeSlot, guestCount }) {
    validateReservationInput({ reservationDate, timeSlot, guestCount });

    const session = await mongoose.startSession();
    try {
      let created;
      await session.withTransaction(async () => {
        const candidateTables = await tableRepository.findSuitableTables(guestCount).session(session);

        if (candidateTables.length === 0) {
          throw new ApiError(404, 'No table exists with enough capacity for this party size');
        }

        let chosenTable = null;
        for (const table of candidateTables) {
          const conflict = await reservationRepository.findConflict(
            table._id,
            reservationDate,
            timeSlot,
            session
          );
          if (!conflict) {
            chosenTable = table;
            break;
          }
        }

        if (!chosenTable) {
          throw new ApiError(409, 'No tables available for the requested date and time');
        }

        const [reservation] = await require('../models/Reservation').create(
          [
            {
              customer: customerId,
              table: chosenTable._id,
              reservationDate,
              timeSlot,
              guestCount,
              status: 'confirmed',
            },
          ],
          { session }
        );

        created = reservation;
      });

      const populated = await reservationRepository.findById(created._id).populate('table', 'tableNumber capacity');

      notificationService
        .notifyUser(
          customerId,
          'customer',
          'Reservation confirmed',
          `Table ${populated.table.tableNumber} on ${reservationDate} at ${timeSlot}`,
          'reservation_created'
        )
        .catch(() => {});
      notificationService
        .notifyAdmins(
          'New reservation',
          `Table ${populated.table.tableNumber} booked for ${reservationDate} at ${timeSlot} (${guestCount} guests)`,
          'reservation_created'
        )
        .catch(() => {});

      return populated;
    } finally {
      session.endSession();
    }
  },

  // Dry-run of the allocation algorithm — no reservation is created. Used by
  // the booking flow to preview which table would be assigned.
  async previewAllocation({ reservationDate, timeSlot, guestCount }) {
    validateReservationInput({ reservationDate, timeSlot, guestCount });

    const candidateTables = await tableRepository.findSuitableTables(guestCount);
    for (const table of candidateTables) {
      const conflict = await reservationRepository.findConflict(table._id, reservationDate, timeSlot);
      if (!conflict) return table;
    }
    return null;
  },

  async getMyReservations(customerId) {
    return reservationRepository.findByCustomer(customerId);
  },

  async cancelOwnReservation(customerId, reservationId) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation) throw new ApiError(404, 'Reservation not found');
    if (String(reservation.customer) !== String(customerId)) {
      throw new ApiError(403, 'You can only cancel your own reservations');
    }
    if (reservation.status === 'cancelled') {
      throw new ApiError(422, 'Reservation is already cancelled');
    }
    const updated = await reservationRepository.updateById(reservationId, { status: 'cancelled' });

    notificationService
      .notifyUser(customerId, 'customer', 'Reservation cancelled', `Your reservation on ${updated.reservationDate} at ${updated.timeSlot} was cancelled`, 'reservation_cancelled')
      .catch(() => {});
    notificationService
      .notifyAdmins('Reservation cancelled', `Customer cancelled table ${updated.table.tableNumber} on ${updated.reservationDate} at ${updated.timeSlot}`, 'reservation_cancelled')
      .catch(() => {});

    return updated;
  },

  async listAll(filter = {}) {
    const reservations = await reservationRepository.findAll();
    return applyReservationFilters(reservations, filter);
  },

  async listByDate(reservationDate, filter = {}) {
    if (!reservationDate || !DATE_REGEX.test(reservationDate)) {
      throw new ApiError(422, 'date query param must be in YYYY-MM-DD format');
    }
    const reservations = await reservationRepository.findByDate(reservationDate);
    return applyReservationFilters(reservations, filter);
  },

  async adminUpdateReservation(reservationId, updates) {
    const allowed = {};
    if (updates.status && ['confirmed', 'cancelled'].includes(updates.status)) {
      allowed.status = updates.status;
    }
    if (updates.timeSlot && TIME_REGEX.test(updates.timeSlot)) {
      allowed.timeSlot = updates.timeSlot;
    }
    if (updates.reservationDate && DATE_REGEX.test(updates.reservationDate)) {
      allowed.reservationDate = updates.reservationDate;
    }

    const reservation = await reservationRepository.updateById(reservationId, allowed);
    if (!reservation) throw new ApiError(404, 'Reservation not found');

    notificationService
      .notifyUser(reservation.customer._id, 'customer', 'Reservation updated', `Your reservation is now ${reservation.status} for ${reservation.reservationDate} at ${reservation.timeSlot}`, 'reservation_updated')
      .catch(() => {});

    return reservation;
  },

  async adminCancelReservation(reservationId) {
    const reservation = await reservationRepository.updateById(reservationId, { status: 'cancelled' });
    if (!reservation) throw new ApiError(404, 'Reservation not found');

    notificationService
      .notifyUser(reservation.customer._id, 'customer', 'Reservation cancelled', `Your reservation on ${reservation.reservationDate} at ${reservation.timeSlot} was cancelled by the restaurant`, 'reservation_cancelled')
      .catch(() => {});

    return reservation;
  },
};

module.exports = reservationService;
