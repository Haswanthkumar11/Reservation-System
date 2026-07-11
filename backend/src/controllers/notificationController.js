const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

const notificationController = {
  list: asyncHandler(async (req, res) => {
    const notifications = await notificationService.listForUser(req.user.id);
    res.status(200).json({ success: true, data: notifications });
  }),

  markRead: asyncHandler(async (req, res) => {
    const notification = await notificationService.markRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notification });
  }),

  markAllRead: asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user.id);
    res.status(200).json({ success: true, data: null });
  }),
};

module.exports = notificationController;
