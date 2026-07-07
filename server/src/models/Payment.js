const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  utrNumber: String,
  transactionId: String,
  screenshotUrl: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'refunded'],
    default: 'pending'
  },
  upiId: String,
  merchantName: String,
  adminNotes: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectedReason: String,
  planActivatedAt: Date,
  planExpiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);