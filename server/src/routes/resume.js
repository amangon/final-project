const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/upload', ctrl.upload.single('resume'), ctrl.uploadResume);
router.get('/my', ctrl.getMyResume);
router.delete('/my', ctrl.deleteResume);
router.post('/analyze', ctrl.analyzeResume);

module.exports = router;