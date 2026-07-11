const Reservation = require('../models/Reservation');

const reservationRepository = {
  create: (data) => Reservation.create(data),

  // Core conflict check: is this exact table already confirmed for this date+time?
  findConflict: (tableId, reservationDate, timeSlot, session = null) => {
    const query = Reservation.findOne({
      table: tableId,
      reservationDate,
      timeSlot,
      status: { $ne: 'cancelled' },
    });
    if (session) query.session(session);
    return query;
  },

  findByCustomer: (customerId) =>
    Reservation.find({ customer: customerId })
      .populate('table', 'tableNumber capacity')
      .sort({ reservationDate: -1, timeSlot: -1 }),

  findById: (id) => Reservation.findById(id),

  findAll: (filter = {}) =>
    Reservation.find(filter)
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort({ reservationDate: -1, timeSlot: -1 }),

  findByDate: (reservationDate) =>
    Reservation.find({ reservationDate })
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort({ timeSlot: 1 }),

  updateById: (id, data) =>
    Reservation.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity'),
};

module.exports = reservationRepository;
