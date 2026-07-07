const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const resultController = require('../controllers/resultController');

router.use(authenticate);
router.get('/', resultController.getResults);
router.get('/analytics', resultController.getAnalytics);
router.get('/:id', resultController.getResult);

module.exports = router;