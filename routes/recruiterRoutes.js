const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const {
    getRecruiterDashboard,
    createJobPost,
    updateJobPost,
    deleteJobPost,
    getApplicants,
    updateApplicationStatus,
    sponsorVisa,
    getVisaApplications,
} = require("../controllers/recruiterController");

const router = express.Router();

// Dashboard Overview
router.get("/dashboard", authenticate, getRecruiterDashboard);

// Job Management
router.post("/jobs", authenticate, createJobPost);
router.put("/jobs/:jobId", authenticate, updateJobPost);
router.delete("/jobs/:jobId", authenticate, deleteJobPost);

// Applicant Management
router.get("/applicants/:jobId", authenticate, getApplicants);
router.put("/applications/:applicationId", authenticate, updateApplicationStatus);

// Visa Management
router.post("/visa/sponsor", authenticate, sponsorVisa);
router.get("/visa/applications", authenticate, getVisaApplications);

module.exports = router;
