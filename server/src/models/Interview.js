const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionText: String,
  answer: String,
  audioUrl: String,
  duration: Number, // seconds taken
  score: { type: Number, default: 0 },
  feedback: String,
  followUpAsked: Boolean,
  followUpQuestion: String,
  followUpAnswer: String,
  aiAnalysis: {
    grammar: Number,
    confidence: Number,
    relevance: Number,
    depth: Number,
    keywords: [String]
  }
});

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'hr', 'coding', 'system-design', 'mixed', 'company-specific'],
    required: true
  },
  mode: {
    type: String,
    enum: ['text', 'voice', 'avatar'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'abandoned'],
    default: 'pending'
  },
  difficulty: String,
  targetCompany: String,
  targetRole: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  answers: [answerSchema],
  totalQuestions: { type: Number, default: 10 },
  currentQuestion: { type: Number, default: 0 },
  startTime: Date,
  endTime: Date,
  duration: Number,
  result: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' },
  overallScore: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  aiSessionId: String,
  notes: String
}, { timestamps: true });

interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);