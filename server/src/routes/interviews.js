const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkDailyLimit } = require('../middleware/planCheck');
const c = require('../controllers/interviewController');

router.use(authenticate);
router.post('/start', checkDailyLimit, c.startInterview);
router.post('/answer', c.submitAnswer);
router.post('/complete/:interviewId', c.completeInterview);
router.get('/', c.getInterviews);
router.get('/:id', c.getInterview);
router.put('/:id/abandon', c.abandonInterview);

module.exports = router;
