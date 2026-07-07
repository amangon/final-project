const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const Notification = require('../models/Notification');
const aiService = require('../utils/aiService');

exports.startInterview = async (req, res) => {
  try {
    const { type, difficulty, targetCompany, targetRole, mode = 'text', totalQuestions = 10 } = req.body;
    const query = { isActive: true };
    if (type && type !== 'mixed') query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (targetCompany) query.companies = targetCompany;
    let questions = await Question.aggregate([{ $match: query }, { $sample: { size: Number(totalQuestions) } }]);
    if (questions.length < totalQuestions) {
      const extra = await Question.aggregate([{ $match: { isActive: true } }, { $sample: { size: totalQuestions - questions.length } }]);
      questions = [...questions, ...extra];
    }
    const interview = await Interview.create({
      user: req.user._id, type, difficulty, targetCompany, targetRole, mode,
      totalQuestions: questions.length, questions: questions.map(q => q._id),
      status: 'in-progress', startTime: new Date()
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { dailyInterviewCount: 1 } });
    res.status(201).json({ message: 'Interview started', interview: { ...interview.toObject(), questions } });
  } catch (e) { res.status(500).json({ error: 'Failed to start interview' }); }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionId, answer, duration } = req.body;
    const interview = await Interview.findOne({ _id: interviewId, user: req.user._id });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.status !== 'in-progress') return res.status(400).json({ error: 'Interview not active' });
    const question = await Question.findById(questionId);
    const aiAnalysis = await aiService.analyzeAnswer(question, answer);
    const answerData = { question: questionId, questionText: question.content, answer, duration, score: aiAnalysis.score, feedback: aiAnalysis.feedback, aiAnalysis: aiAnalysis.breakdown };
    if (aiAnalysis.score < 70) { answerData.followUpAsked = true; answerData.followUpQuestion = await aiService.generateFollowUp(question, answer); }
    interview.answers.push(answerData);
    interview.currentQuestion += 1;
    if (interview.currentQuestion >= interview.totalQuestions) { interview.status = 'completed'; interview.endTime = new Date(); interview.duration = Math.round((interview.endTime - interview.startTime) / 1000); }
    await interview.save();
    res.json({ analysis: aiAnalysis, followUp: answerData.followUpQuestion || null, isCompleted: interview.status === 'completed', currentQuestion: interview.currentQuestion });
  } catch (e) { res.status(500).json({ error: 'Failed to submit answer' }); }
};

exports.completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.interviewId, user: req.user._id }).populate('questions');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    interview.status = 'completed';
    interview.endTime = interview.endTime || new Date();
    interview.duration = interview.duration || Math.round((interview.endTime - interview.startTime) / 1000);
    const resultData = await aiService.generateResult(interview);
    const savedResult = await Result.create({ interview: interview._id, user: req.user._id, ...resultData });
    interview.result = savedResult._id;
    interview.overallScore = savedResult.overallScore;
    interview.xpEarned = Math.round(savedResult.overallScore * 0.5);
    interview.coinsEarned = Math.round(savedResult.overallScore * 0.1);
    await interview.save();
    const user = await User.findById(req.user._id);
    user.xp += interview.xpEarned; user.coins += interview.coinsEarned; user.totalInterviews += 1; user.level = user.calculateLevel();
    const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (user.lastInterviewDate?.toDateString() === yesterday.toDateString()) user.interviewStreak += 1;
    else if (user.lastInterviewDate?.toDateString() !== today.toDateString()) user.interviewStreak = 1;
    user.lastInterviewDate = today;
    await user.save();
    await Notification.create({ user: req.user._id, title: 'Interview Completed!', message: `Score: ${savedResult.overallScore}% | +${interview.xpEarned} XP | +${interview.coinsEarned} coins`, type: 'success' });
    res.json({ result: savedResult, xpEarned: interview.xpEarned, coinsEarned: interview.coinsEarned });
  } catch (e) { res.status(500).json({ error: 'Failed to complete interview' }); }
};

exports.getInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;
    const interviews = await Interview.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).populate('result');
    const total = await Interview.countDocuments(query);
    res.json({ interviews, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch interviews' }); }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate('questions').populate('result');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ interview });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch interview' }); }
};

exports.abandonInterview = async (req, res) => {
  try {
    await Interview.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { status: 'abandoned', endTime: new Date() });
    res.json({ message: 'Interview abandoned' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
};
