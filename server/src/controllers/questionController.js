const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  try {
    const { type, difficulty, category, page = 1, limit = 20, search } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const questions = await Question.find(query)
      .sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Question.countDocuments(query);

    res.json({ success: true, questions, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get questions' });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get question' });
  }
};

exports.adminCreateQuestion = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

exports.adminUpdateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
};

exports.adminDeleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Question.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
};