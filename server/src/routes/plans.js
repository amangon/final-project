const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const planController = require('../controllers/planController');

router.get('/', planController.getPlans);
router.get('/:id', authenticate, planController.getPlan);

module.exports = router;