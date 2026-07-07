const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  overallScore: { type: Number, default: 0 },
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    behavioural: { type: Number, default: 0 }
  },
  strengths: [String],
  weaknesses: [String],
  improvementPlan: [String],
  detailedFeedback: String,
  questionAnalysis: [{
    question: String,
    answer: String,
    score: Number,
    feedback: String,
    suggestions: [String]
  }],
  timeAnalysis: {
    totalTime: Number,
    averageTimePerQuestion: Number,
    fastestAnswer: Number,
    slowestAnswer: Number
  },
  recommendation: String,
  readinessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  certificateUrl: String,
  pdfUrl: String,
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);