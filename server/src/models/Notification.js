const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'achievement', 'payment', 'system'],
    default: 'info'
  },
  isRead: { type: Boolean, default: false },
  isGlobal: { type: Boolean, default: false },
  actionUrl: String,
  icon: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
