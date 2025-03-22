const express = require("express");
const router = express.Router();
const {
    getProfile,
    updateProfile,
    uploadResume,
    getAppliedJobs,
    applyForJob,
    getInterviews,
    getVisaApplications,
    
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Get user profile
router.get("/profile", authenticate, getProfile);

// Update user profile
router.put("/profile", authenticate, updateProfile);

// Upload resume
router.post("/upload-resume", authenticate, upload.single("resume"), uploadResume);

// Get all applied jobs
router.get("/applied-jobs", authenticate, getAppliedJobs);

// Apply for a job
router.post("/apply/:jobId", authenticate, applyForJob);

// Get scheduled interviews
router.get("/interviews", authenticate, getInterviews);

// Get visa applications
router.get("/visa-applications", authenticate, getVisaApplications);

// Get job details
// router.get("/jobs/:jobId", authenticate, getJobDetails);

// Get recommended jobs
// router.get("/jobs/recommended", authenticate, getRecommendedJobs);

module.exports = router;