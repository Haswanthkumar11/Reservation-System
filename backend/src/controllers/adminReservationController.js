const asyncHandler = require('../utils/asyncHandler');
const reservationService = require('../services/reservationService');

const pickFilters = (query) => ({
  status: query.status || undefined,
  timeSlot: query.timeSlot || undefined,
  search: query.search || undefined,
});

const adminReservationController = {
  listAll: asyncHandler(async (req, res) => {
    const reservations = await reservationService.listAll(pickFilters(req.query));
    res.status(200).json({ success: true, data: reservations });
  }),

  listByDate: asyncHandler(async (req, res) => {
    const reservations = await reservationService.listByDate(req.query.date, pickFilters(req.query));
    res.status(200).json({ success: true, data: reservations });
  }),

  update: asyncHandler(async (req, res) => {
    const reservation = await reservationService.adminUpdateReservation(req.params.id, req.body);
    res.status(200).json({ success: true, data: reservation });
  }),

  cancel: asyncHandler(async (req, res) => {
    const reservation = await reservationService.adminCancelReservation(req.params.id);
    res.status(200).json({ success: true, data: reservation });
  }),
};

module.exports = adminReservationController;
