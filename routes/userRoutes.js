const express = require("express");
const router = express.Router();
const {
    getProfile,
    updateProfile,
    getAppliedJobs,
    applyForJob,
    getInterviews
} = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");

// Get user profile
router.get("/profile", authenticate, getProfile);

// Update user profile
router.put("/profile", authenticate, updateProfile);

// Get all applied jobs
router.get("/applied-jobs", authenticate, getAppliedJobs);

// Apply for a job
router.post("/apply/:jobId", authenticate, applyForJob);

// Get scheduled interviews
router.get("/interviews", authenticate, getInterviews);

module.exports = router;
