const asyncHandler = require('../utils/asyncHandler');
const settingsService = require('../services/settingsService');

const settingsController = {
  get: asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings();
    res.status(200).json({ success: true, data: settings });
  }),

  update: asyncHandler(async (req, res) => {
    const settings = await settingsService.updateSettings(req.body);
    res.status(200).json({ success: true, data: settings });
  }),

  slots: asyncHandler(async (req, res) => {
    const slots = await settingsService.generateSlots();
    res.status(200).json({ success: true, data: slots });
  }),
};

module.exports = settingsController;
