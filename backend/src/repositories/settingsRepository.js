const RestaurantSettings = require('../models/RestaurantSettings');

const settingsRepository = {
  // Singleton row: return the first (and only) document, creating defaults if missing.
  async findOrCreate() {
    let settings = await RestaurantSettings.findOne();
    if (!settings) settings = await RestaurantSettings.create({});
    return settings;
  },
  async update(data) {
    const settings = await this.findOrCreate();
    Object.assign(settings, data);
    return settings.save();
  },
};

module.exports = settingsRepository;
