const asyncHandler = require('../utils/asyncHandler');
const reservationService = require('../services/reservationService');

const reservationController = {
  create: asyncHandler(async (req, res) => {
    const reservation = await reservationService.createReservation(req.user.id, req.body);
    res.status(201).json({ success: true, data: reservation });
  }),

  preview: asyncHandler(async (req, res) => {
    const { reservationDate, timeSlot, guestCount } = req.query;
    const table = await reservationService.previewAllocation({
      reservationDate,
      timeSlot,
      guestCount: Number(guestCount),
    });
    res.status(200).json({ success: true, data: table });
  }),

  myReservations: asyncHandler(async (req, res) => {
    const reservations = await reservationService.getMyReservations(req.user.id);
    res.status(200).json({ success: true, data: reservations });
  }),

  cancelOwn: asyncHandler(async (req, res) => {
    const reservation = await reservationService.cancelOwnReservation(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: reservation });
  }),
};

module.exports = reservationController;
