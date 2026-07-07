const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/userController');

router.use(authenticate);
router.get('/profile', c.getProfile);
router.put('/profile', c.updateProfile);
router.put('/preferences', c.updatePreferences);
router.get('/dashboard', c.getDashboard);
router.put('/change-password', c.changePassword);

module.exports = router;
