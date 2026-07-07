const User = require('../models/User');
const Interview = require('../models/Interview');
const Result = require('../models/Result');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('plan').populate('achievements').populate('resume');
    res.json({ user });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch profile' }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name','phone','location','bio','linkedIn','github','website','skills','targetRole','targetCompany','experience'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).populate('plan');
    res.json({ message: 'Profile updated', user });
  } catch (e) { res.status(500).json({ error: 'Profile update failed' }); }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.preferences = { ...user.preferences.toObject(), ...req.body };
    await user.save();
    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (e) { res.status(500).json({ error: 'Failed to update preferences' }); }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const [recentInterviews, allResults] = await Promise.all([
      Interview.find({ user: userId }).sort({ createdAt: -1 }).limit(5).populate('result'),
      Result.find({ user: userId })
    ]);
    const avgScore = allResults.length ? Math.round(allResults.reduce((s, r) => s + r.overallScore, 0) / allResults.length) : 0;
    res.json({
      user: req.user,
      stats: { totalInterviews: req.user.totalInterviews, avgScore, streak: req.user.interviewStreak, xp: req.user.xp, coins: req.user.coins, level: req.user.level },
      recentInterviews
    });
  } catch (e) { res.status(500).json({ error: 'Dashboard fetch failed' }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!await user.comparePassword(currentPassword)) return res.status(400).json({ error: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (e) { res.status(500).json({ error: 'Password change failed' }); }
};
