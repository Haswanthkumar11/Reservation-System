const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    reservationDate: { type: String, required: true }, // stored as 'YYYY-MM-DD'
    timeSlot: { type: String, required: true }, // stored as 'HH:mm' (24h)
    guestCount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

// Speeds up conflict-check queries (table + date + time + status)
reservationSchema.index({ table: 1, reservationDate: 1, timeSlot: 1, status: 1 });
reservationSchema.index({ customer: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
