const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  enabled: { type: Boolean, default: true },
  limit: { type: Number, default: -1 }, // -1 = unlimited
  value: mongoose.Schema.Types.Mixed
});

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  currency: { type: String, default: 'INR' },
  duration: { type: Number, required: true }, // days
  durationType: { type: String, enum: ['days', 'months', 'years'], default: 'days' },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  color: { type: String, default: '#6366f1' },
  icon: String,
  features: [featureSchema],
  limits: {
    dailyInterviews: { type: Number, default: 5 },
    aiChats: { type: Number, default: 20 },
    resumeUploads: { type: Number, default: 1 },
    voiceInterviews: { type: Number, default: 0 },
    avatarInterviews: { type: Number, default: 0 },
    certificates: { type: Number, default: 0 }
  },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);