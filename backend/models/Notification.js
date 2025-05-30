const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  message: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);