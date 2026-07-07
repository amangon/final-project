const aiService = require('../utils/aiService');
const User = require('../models/User');

exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const user = await User.findById(req.user._id);
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));

    if (!user.aiChatReset || user.aiChatReset < todayStart) {
      user.aiChatCount = 0;
      user.aiChatReset = new Date();
    }

    const chatLimit = user.plan?.limits?.aiChats ?? 20;
    if (chatLimit !== -1 && user.aiChatCount >= chatLimit) {
      return res.status(429).json({ error: 'Daily AI chat limit reached', code: 'CHAT_LIMIT_EXCEEDED' });
    }

    const response = await aiService.chatWithAI(message, context || []);
    user.aiChatCount += 1;
    await user.save();

    res.json({ success: true, response, remaining: chatLimit === -1 ? -1 : chatLimit - user.aiChatCount });
  } catch (error) {
    res.status(500).json({ error: 'AI chat failed' });
  }
};

exports.analyzeAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });
    const analysis = await aiService.analyzeAnswer(question, answer);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
};

exports.generateQuestions = async (req, res) => {
  try {
    const { type, role, company, count } = req.body;
    const questions = await aiService.generateInterviewQuestions(type, role, company, count);
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

exports.getCareerAdvice = async (req, res) => {
  try {
    const { topic } = req.body;
    const advice = await aiService.chatWithAI(`Give me career advice about: ${topic}`, []);
    res.json({ success: true, advice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get career advice' });
  }
};