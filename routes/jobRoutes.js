const express = require('express');
const router = express.Router();
const { browseJobs, getAllJobs, getRecommendedJobs } = require('../controllers/jobController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/browse', browseJobs);          // Public
router.get('/all', getAllJobs);             // Public
router.get('/recommended', authenticate, getRecommendedJobs); // 🔒 Protected

module.exports = router;
