const express = require('express');
const router = express.Router();
const { saveJobPreferences } = require('../controllers/jobPreferenceController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/job-preferences', authenticate, saveJobPreferences);

module.exports = router;
