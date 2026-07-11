const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');

const notificationService = {
  listForUser: (userId) => notificationRepository.findByUser(userId),
  markRead: (id, userId) => notificationRepository.markRead(id, userId),
  markAllRead: (userId) => notificationRepository.markAllRead(userId),

  notifyUser: (userId, role, title, message, type) =>
    notificationRepository.create({ user: userId, role, title, message, type }),

  // Fan out a notification to every admin (used for booking events admins should see).
  async notifyAdmins(title, message, type) {
    const admins = await userRepository.findAdmins();
    return Promise.all(
      admins.map((admin) =>
        notificationRepository.create({ user: admin._id, role: 'admin', title, message, type })
      )
    );
  },
};

module.exports = notificationService;
