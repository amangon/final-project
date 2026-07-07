const User = require('../models/User');
const Interview = require('../models/Interview');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Plan = require('../models/Plan');
const Result = require('../models/Result');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (status === 'suspended') query.isSuspended = true;
    if (status === 'active') query.isSuspended = false;

    const users = await User.find(query)
      .populate('plan', 'name slug color')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');
    const total = await User.countDocuments(query);

    res.json({ success: true, users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('plan').populate('resume').populate('achievements');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [interviews, payments] = await Promise.all([
      Interview.find({ user: user._id }).sort('-createdAt').limit(10).populate('result'),
      Payment.find({ user: user._id }).populate('plan').sort('-createdAt')
    ]);

    res.json({ success: true, user, interviews, payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'isActive', 'isSuspended', 'xp', 'coins', 'level', 'plan', 'planExpiry'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('plan');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true });
    await Notification.create({ user: user._id, type: 'warning', title: 'Account Suspended', message: 'Your account has been suspended. Contact support.' });
    res.json({ success: true, message: 'User suspended' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to suspend user' });
  }
};

exports.activateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isSuspended: false, isActive: true });
    res.json({ success: true, message: 'User activated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.upgradePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + plan.duration);

    await User.findByIdAndUpdate(req.params.id, { plan: planId, planExpiry: expiry });
    await Notification.create({
      user: req.params.id, type: 'success',
      title: 'Plan Upgraded!',
      message: `Your plan has been upgraded to ${plan.name} by admin.`
    });
    res.json({ success: true, message: 'Plan upgraded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade plan' });
  }
};

exports.resetUserStats = async (req, res) => {
  try {
    const { type } = req.body;
    const updates = {};
    if (type === 'xp') updates.xp = 0;
    if (type === 'coins') updates.coins = 0;
    if (type === 'all') { updates.xp = 0; updates.coins = 0; updates.interviewStreak = 0; }
    await User.findByIdAndUpdate(req.params.id, updates);
    res.json({ success: true, message: 'Stats reset' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset stats' });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type, isGlobal } = req.body;
    if (isGlobal) {
      const users = await User.find({ role: 'user' }).select('_id');
      await Notification.insertMany(users.map(u => ({ user: u._id, title, message, type: type || 'info' })));
    } else {
      await Notification.create({ user: userId, title, message, type: type || 'info' });
    }
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalInterviews, pendingPayments, recentUsers, recentPayments] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true, isSuspended: false }),
      Interview.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'pending' }),
      User.find({ role: 'user' }).sort('-createdAt').limit(5).select('name email createdAt').populate('plan', 'name'),
      Payment.find().sort('-createdAt').limit(5).populate('user', 'name email').populate('plan', 'name price')
    ]);

    const revenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      dashboard: {
        totalUsers, activeUsers, totalInterviews,
        pendingPayments, totalRevenue: revenue[0]?.total || 0,
        recentUsers, recentPayments
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get admin dashboard' });
  }
};