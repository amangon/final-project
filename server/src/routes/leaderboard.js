const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find({ isActive: true, role: 'user', isSuspended: false })
      .select('name avatar xp level totalInterviews interviewStreak')
      .sort('-xp').limit(100);
    res.json({ success: true, leaderboard: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

module.exports = router;