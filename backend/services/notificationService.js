const Notification = require('../models/Notification');
exports.createNotification = async (userId, message) => {
  const notif = new Notification({ user: userId, message });
  await notif.save();
};