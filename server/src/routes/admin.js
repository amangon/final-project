const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate, isAdmin);
router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getAllUsers);
router.get('/users/:id', ctrl.getUserById);
router.put('/users/:id', ctrl.updateUser);
router.post('/users/:id/suspend', ctrl.suspendUser);
router.post('/users/:id/activate', ctrl.activateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.post('/users/:id/upgrade-plan', ctrl.upgradePlan);
router.post('/users/:id/reset-stats', ctrl.resetUserStats);
router.post('/notifications/send', ctrl.sendNotification);

module.exports = router;