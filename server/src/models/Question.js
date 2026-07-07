const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'hr', 'coding', 'system-design', 'resume'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: { type: String, required: true },
  subcategory: String,
  tags: [String],
  companies: [String],
  expectedAnswer: String,
  keyPoints: [String],
  followUpQuestions: [String],
  codeTemplate: String,
  language: String,
  testCases: [{
    input: String,
    output: String,
    explanation: String
  }],
  timeLimit: { type: Number, default: 120 }, // seconds
  xpReward: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

questionSchema.index({ type: 1, difficulty: 1, category: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ companies: 1 });

module.exports = mongoose.model('Question', questionSchema);
