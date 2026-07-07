const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/questionController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getQuestions);
router.get('/categories', authenticate, ctrl.getCategories);
router.get('/:id', authenticate, ctrl.getQuestion);
router.post('/admin', authenticate, isAdmin, ctrl.adminCreateQuestion);
router.put('/admin/:id', authenticate, isAdmin, ctrl.adminUpdateQuestion);
router.delete('/admin/:id', authenticate, isAdmin, ctrl.adminDeleteQuestion);

module.exports = router;