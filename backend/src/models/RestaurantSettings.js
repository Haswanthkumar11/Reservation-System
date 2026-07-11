const mongoose = require('mongoose');

// Singleton document (one row) — configurable opening hours + slot duration.
const restaurantSettingsSchema = new mongoose.Schema(
  {
    openingTime: { type: String, default: '11:00' }, // HH:mm 24h
    closingTime: { type: String, default: '23:00' },
    slotDurationMinutes: { type: Number, default: 30 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestaurantSettings', restaurantSettingsSchema);
