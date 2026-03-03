const express = require('express');
const router = express.Router();
const { 
  saveJobPreferences,
  getJobPreferences,
  updateJobPreferences,
  deleteJobPreferences
} = require('../controllers/jobPreferenceController');
const { authenticate } = require('../middleware/authMiddleware');

// Get current user's job preferences
router.get('/job-preferences', authenticate, getJobPreferences);

// Create or save job preferences (POST for create)
router.post('/job-preferences', authenticate, saveJobPreferences);

// Update job preferences (PUT for full update)
router.put('/job-preferences', authenticate, updateJobPreferences);

// Delete job preferences
router.delete('/job-preferences', authenticate, deleteJobPreferences);

module.exports = router;
