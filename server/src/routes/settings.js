const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/public', ctrl.getPublicSettings);
router.get('/admin', authenticate, isAdmin, ctrl.adminGetSettings);
router.put('/admin', authenticate, isAdmin, ctrl.adminUpdateSetting);
router.put('/admin/bulk', authenticate, isAdmin, ctrl.adminUpdateMultiple);

module.exports = router;