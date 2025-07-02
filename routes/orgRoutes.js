const express = require('express');
const router = express.Router();
const jobController = require('../controllers/orgController');
const isVerifiedOrg = require('../middleware/isVerifiedOrg');
const { authenticate } = require('../middleware/authMiddleware');

// Protect with auth + verified org
router.post('/org/jobs', authenticate, jobController.createJob);
router.put('/org/jobs/:jobId', authenticate, jobController.updateJob);
router.delete('/org/jobs/:jobId', authenticate, jobController.deleteJob);
// routes/application.js
router.get('/org', authenticate, jobController.getApplicationsForOrg);
router.patch('/applications/:id/status', authenticate, jobController.updateStatus);

router.get("/recruiter", authenticate, jobController.getRecruiter);
router.put("/update-recruiter", authenticate, jobController.updateRecruiter);
// Get all applications for a job, optionally filtered by status
router.get('/applications/job/:jobId', authenticate, jobController.getApplicationsByJobAndStatus);

// router.put('/applications/:applicationId/status', authenticate,  jobController.updateApplicationStatus);
router.get('/org/all', authenticate, isVerifiedOrg, jobController.getAllJobsByOrganization);
router.get('/org/drafts', authenticate, isVerifiedOrg, jobController.getDraftJobsByOrganization);
router.get('/jobs/:id/preview', jobController.getJobByIdForPreview);

router.get('/jobs/active/:id', jobController.getActiveJobById); // public route
module.exports = router;
