const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

router.use(authenticate);
router.post('/submit', ctrl.upload.single('screenshot'), ctrl.submitPayment);
router.get('/my', ctrl.getMyPayments);
router.get('/admin/all', isAdmin, ctrl.adminGetPayments);
router.post('/admin/:id/approve', isAdmin, ctrl.adminApprovePayment);
router.post('/admin/:id/reject', isAdmin, ctrl.adminRejectPayment);

module.exports = router;