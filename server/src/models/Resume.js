const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  fileUrl: String,
  fileSize: Number,
  parsedData: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: [{
      company: String,
      role: String,
      duration: String,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      url: String
    }],
    certifications: [String],
    summary: String
  },
  atsScore: { type: Number, default: 0 },
  atsAnalysis: {
    keywords: [String],
    missingKeywords: [String],
    suggestions: [String],
    strengths: [String],
    weaknesses: [String]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);