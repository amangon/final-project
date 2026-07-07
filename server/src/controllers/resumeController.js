const Resume = require('../models/Resume');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes/'),
  filename: (req, file, cb) => cb(null, `resume_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`)
});

exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF and Word documents allowed'));
  }
});

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const existingResume = await Resume.findOne({ user: req.user._id });
    if (existingResume) {
      existingResume.fileName = req.file.originalname;
      existingResume.fileUrl = `/uploads/resumes/${req.file.filename}`;
      existingResume.fileSize = req.file.size;
      existingResume.atsScore = Math.floor(Math.random() * 30) + 60;
      existingResume.atsAnalysis = {
        keywords: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        missingKeywords: ['TypeScript', 'AWS', 'Docker'],
        suggestions: [
          'Add more quantifiable achievements',
          'Include relevant keywords from job descriptions',
          'Add a professional summary section'
        ],
        strengths: ['Good technical skills listed', 'Clear project descriptions'],
        weaknesses: ['Missing metrics', 'No certifications listed']
      };
      await existingResume.save();
      await User.findByIdAndUpdate(req.user._id, { resume: existingResume._id });
      return res.json({ success: true, resume: existingResume });
    }

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileSize: req.file.size,
      atsScore: Math.floor(Math.random() * 30) + 60,
      atsAnalysis: {
        keywords: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        missingKeywords: ['TypeScript', 'AWS', 'Docker'],
        suggestions: [
          'Add more quantifiable achievements',
          'Include relevant keywords from job descriptions',
          'Add a professional summary section'
        ],
        strengths: ['Good technical skills listed', 'Clear project descriptions'],
        weaknesses: ['Missing metrics', 'No certifications listed']
      }
    });

    await User.findByIdAndUpdate(req.user._id, { resume: resume._id });
    res.status(201).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

exports.getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'No resume found' });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get resume' });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    await Resume.findOneAndDelete({ user: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { resume: null });
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
};

exports.analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'No resume found' });

    resume.atsScore = Math.floor(Math.random() * 20) + 70;
    resume.atsAnalysis = {
      keywords: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'REST API'],
      missingKeywords: ['TypeScript', 'AWS', 'Docker', 'CI/CD', 'Agile'],
      suggestions: [
        'Add quantifiable metrics to your achievements (e.g., "Improved performance by 40%")',
        'Include more industry keywords relevant to your target role',
        'Add a strong professional summary at the top',
        'List certifications and online courses',
        'Include links to GitHub and portfolio projects'
      ],
      strengths: [
        'Strong technical skills section',
        'Good project descriptions',
        'Clear education background'
      ],
      weaknesses: [
        'Missing impact metrics',
        'No certifications listed',
        'Summary section could be stronger'
      ]
    };
    await resume.save();
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};