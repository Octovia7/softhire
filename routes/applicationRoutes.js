// routes/applicationRoutes.js

const express = require('express');
const router = express.Router();
const { submitApplication, getMyApplications, checkApplicationStatus } = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authMiddleware');

// ✅ Test route (for debugging)
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Application routes are working!',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/application/test',
      'POST /api/application/apply',
      'GET /api/application/my',
      'GET /api/application/check/:jobId'
    ]
  });
});

// ✅ Application routes
router.post('/apply', authenticate, submitApplication);
router.get('/my', authenticate, getMyApplications);
router.get('/check/:jobId', authenticate, checkApplicationStatus);

console.log('✅ Application routes loaded successfully');

module.exports = router;
