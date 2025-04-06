const express = require("express");
const {
    submitSponsorAssessment,
    getAllJobs,
    getJobDetails
} = require("../controllers/sponsorEligibilityController");

const { authenticate, authorizeRecruiter } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit sponsor assessment
router.post("/assessment", authenticate, authorizeRecruiter, submitSponsorAssessment);

// Get all job roles + codes for dropdown
router.get("/jobs", getAllJobs);

// Get job details by code (optional: for min salary)
router.get("/jobs/:jobCode", getJobDetails);

module.exports = router;
