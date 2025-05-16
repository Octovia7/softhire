const express = require('express');
const router = express.Router();
const { saveJobExpectations } = require('../controllers/jobExpectationController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/job-expectations', authenticate, saveJobExpectations);

module.exports = router;
