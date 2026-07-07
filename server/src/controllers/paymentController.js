const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const emailService = require('../utils/emailService');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/screenshots/'),
  filename: (req, file, cb) => cb(null, `payment-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

exports.upload = upload;

exports.getPaymentSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'payment_config' });
    if (!settings) return res.json({ config: null });
    const { upiId, businessName, merchantName } = settings.value;
    res.json({ config: { upiId, businessName, merchantName } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment settings' });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const settings = await Settings.findOne({ key: 'payment_config' });
    if (!settings) return res.status(400).json({ error: 'Payment not configured' });

    const { upiId, businessName, merchantName } = settings.value;
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(plan.name + ' Plan')}`;

    const QRCode = require('qrcode');
    const qrDataUrl = await QRCode.toDataURL(upiString);

    res.json({ qrCode: qrDataUrl, upiString, upiId, merchantName, amount: plan.price, planName: plan.name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR' });
  }
};

exports.submitPayment = async (req, res) => {
  try {
    const { planId, utrNumber, transactionId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const settings = await Settings.findOne({ key: 'payment_config' });
    const paymentConfig = settings?.value || {};

    const payment = await Payment.create({
      user: req.user._id,
      plan: planId,
      amount: plan.price,
      currency: plan.currency,
      utrNumber,
      transactionId,
      screenshotUrl: req.file ? `/uploads/screenshots/${req.file.filename}` : null,
      upiId: paymentConfig.upiId,
      merchantName: paymentConfig.merchantName,
      status: 'pending'
    });

    await Notification.create({
      user: req.user._id,
      title: 'Payment Submitted ✅',
      message: `Your payment of ₹${plan.price} for ${plan.name} plan is under review.`,
      type: 'payment'
    });

    try {
      await emailService.sendPaymentConfirmation(req.user, payment);
    } catch (e) {}

    res.status(201).json({ message: 'Payment submitted successfully', payment });
  } catch (error) {
    res.status(500).json({ error: 'Payment submission failed' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('plan');
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

exports.adminGetPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).populate('user').populate('plan');
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

exports.adminApprovePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.status = 'approved';
    await payment.save();

    await User.findByIdAndUpdate(payment.user, { $set: { plan: payment.plan } });

    res.json({ message: 'Payment approved', payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve payment' });
  }
};

exports.adminRejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.status = 'rejected';
    await payment.save();

    res.json({ message: 'Payment rejected', payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject payment' });
  }
};