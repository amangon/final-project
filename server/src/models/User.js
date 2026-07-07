const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const loginLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  device: String,
  browser: String,
  location: String,
  success: Boolean
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
  planExpiry: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 100 },
  level: { type: Number, default: 1 },
  interviewStreak: { type: Number, default: 0 },
  lastInterviewDate: Date,
  totalInterviews: { type: Number, default: 0 },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  skills: [String],
  targetRole: String,
  targetCompany: String,
  experience: String,
  phone: String,
  location: String,
  bio: String,
  linkedIn: String,
  github: String,
  website: String,
  preferences: {
    darkMode: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },
  loginLogs: [loginLogSchema],
  lastLogin: Date,
  dailyInterviewCount: { type: Number, default: 0 },
  dailyInterviewReset: Date,
  aiChatCount: { type: Number, default: 0 },
  aiChatReset: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate level from XP
userSchema.methods.calculateLevel = function() {
  const xpPerLevel = 500;
  return Math.floor(this.xp / xpPerLevel) + 1;
};

// Virtual for interview history
userSchema.virtual('interviewHistory', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'user'
});

module.exports = mongoose.model('User', userSchema);