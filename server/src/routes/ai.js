const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/chat', ctrl.chat);
router.post('/analyze-answer', ctrl.analyzeAnswer);
router.post('/generate-questions', ctrl.generateQuestions);
router.post('/career-advice', ctrl.getCareerAdvice);

module.exports = router;