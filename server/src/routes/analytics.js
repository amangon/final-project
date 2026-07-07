const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/my', authenticate, ctrl.getUserAnalytics);
router.get('/admin', authenticate, isAdmin, ctrl.adminGetAnalytics);

module.exports = router;