const express = require('express');
const router = express.Router();
const jobController = require('../controllers/orgController');
const isVerifiedOrg = require('../middleware/isVerifiedOrg');
const { authenticate } = require('../middleware/authMiddleware');

// Protect with auth + verified org
router.post('/org/jobs', authenticate, isVerifiedOrg, jobController.createJob);
router.put('/org/jobs/:id', authenticate, isVerifiedOrg, jobController.updateJob);
router.delete('/org/jobs/:id', authenticate, isVerifiedOrg, jobController.deleteJob);
// routes/application.js
router.get('/org', authenticate, isVerifiedOrg, jobController.getApplicationsForOrg);
router.put('/applications/:applicationId/status', authenticate, isVerifiedOrg, jobController.updateApplicationStatus);


module.exports = router;
