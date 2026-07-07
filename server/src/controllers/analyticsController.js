const Interview = require('../models/Interview');
const Result = require('../models/Result');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const since = new Date(); since.setDate(since.getDate() - days);

    const [interviews, results] = await Promise.all([
      Interview.find({ user: userId, createdAt: { $gte: since } }).sort('createdAt'),
      Result.find({ user: userId, createdAt: { $gte: since } }).sort('createdAt')
    ]);

    const scoreHistory = results.map(r => ({
      date: r.createdAt.toISOString().split('T')[0],
      score: r.overallScore
    }));

    const typeBreakdown = interviews.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {});

    const avgScores = results.length ? {
      technical: Math.round(results.reduce((s,r) => s + r.scores.technical, 0) / results.length),
      communication: Math.round(results.reduce((s,r) => s + r.scores.communication, 0) / results.length),
      grammar: Math.round(results.reduce((s,r) => s + r.scores.grammar, 0) / results.length),
      confidence: Math.round(results.reduce((s,r) => s + r.scores.confidence, 0) / results.length),
      problemSolving: Math.round(results.reduce((s,r) => s + r.scores.problemSolving, 0) / results.length)
    } : {};

    res.json({
      success: true,
      analytics: {
        totalInterviews: interviews.length,
        completedInterviews: interviews.filter(i => i.status === 'completed').length,
        avgScore: results.length ? Math.round(results.reduce((s,r) => s + r.overallScore, 0) / results.length) : 0,
        scoreHistory, typeBreakdown, avgScores,
        bestScore: results.length ? Math.max(...results.map(r => r.overallScore)) : 0,
        worstScore: results.length ? Math.min(...results.map(r => r.overallScore)) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

exports.adminGetAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalInterviews, totalPayments, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Interview.countDocuments({ status: 'completed' }),
      Payment.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.find({ role: 'user' }).sort('-createdAt').limit(5).select('name email createdAt plan')
    ]);

    const userGrowth = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }, { $limit: 30 }
    ]);

    const interviewsByType = await Interview.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }, { $limit: 12 }
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers, totalInterviews,
        totalRevenue: totalPayments[0]?.total || 0,
        recentUsers, userGrowth, interviewsByType, revenueByMonth
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get admin analytics' });
  }
};