const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().notEmpty().isLength({ max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
], ctrl.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], ctrl.login);

router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], ctrl.adminLogin);

router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);
router.post('/forgot-password', [body('email').isEmail()], ctrl.forgotPassword);
router.post('/reset-password/:token', [body('password').isLength({ min: 8 })], ctrl.resetPassword);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.post('/refresh-token', ctrl.refreshToken);

module.exports = router;