const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  category: {
    type: String,
    enum: ['general', 'smtp', 'payment', 'ai', 'security', 'appearance'],
    default: 'general'
  },
  label: String,
  description: String,
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);