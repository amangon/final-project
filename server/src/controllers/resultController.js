const Result = require('../models/Result');
const Interview = require('../models/Interview');

exports.getResults = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const results = await Result.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate({ path: 'interview', select: 'type mode duration targetCompany targetRole' });

    const total = await Result.countDocuments({ user: req.user._id });
    res.json({ results, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

exports.getResult = async (req, res) => {
  try {
    const result = await Result.findOne({ _id: req.params.id, user: req.user._id })
      .populate({ path: 'interview', populate: { path: 'questions' } });
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch result' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id }).sort({ createdAt: 1 });

    const scoreHistory = results.map(r => ({
      date: r.createdAt, score: r.overallScore
    }));

    const avgScores = {
      technical: 0, communication: 0, grammar: 0,
      confidence: 0, problemSolving: 0, behavioural: 0
    };

    if (results.length > 0) {
      results.forEach(r => {
        Object.keys(avgScores).forEach(k => {
          avgScores[k] += (r.scores[k] || 0);
        });
      });
      Object.keys(avgScores).forEach(k => {
        avgScores[k] = Math.round(avgScores[k] / results.length);
      });
    }

    res.json({ scoreHistory, avgScores, totalResults: results.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};