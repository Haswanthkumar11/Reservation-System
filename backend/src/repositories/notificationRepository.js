const Notification = require('../models/Notification');

const notificationRepository = {
  create: (data) => Notification.create(data),
  findByUser: (userId) => Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50),
  markRead: (id, userId) =>
    Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true }),
  markAllRead: (userId) => Notification.updateMany({ user: userId, isRead: false }, { isRead: true }),
};

module.exports = notificationRepository;
