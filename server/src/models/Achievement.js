const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  color: String,
  xpReward: { type: Number, default: 0 },
  coinsReward: { type: Number, default: 0 },
  condition: {
    type: { type: String },
    value: Number
  },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);