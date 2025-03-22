const express = require("express");
const { authenticate, authorizeRecruiter } = require("../middleware/authMiddleware");
const {
    getRecruiterDashboard,
    createJobPost,
    updateJobPost,
    deleteJobPost,
    getApplicants,
    sponsorVisa,
    getVisaApplications,
    updateVisaStatus,
    assignVisaToRecruiter,
    getRecruiterProfile,
    updateRecruiterProfile
} = require("../controllers/recruiterController");

const router = express.Router();

// ✅ Middleware: Ensure only authenticated recruiters can access these routes
router.use(authenticate, authorizeRecruiter);

// ✅ Recruiter Dashboard
router.get("/dashboard", getRecruiterDashboard);

// ✅ Job Management
router.post("/jobs", createJobPost);
router.put("/jobs/:jobId", updateJobPost);
router.delete("/jobs/:jobId", deleteJobPost);

// ✅ Applicant Management
router.get("/jobs/:jobId/applicants", getApplicants);

// ✅ Visa Management
router.post("/visa/sponsor", sponsorVisa);
router.get("/visa/applications", getVisaApplications);
router.put("/visa/applications/:applicationId/status", updateVisaStatus);
router.put("/visa/applications/:applicationId/assign", assignVisaToRecruiter);

// ✅ Recruiter Profile
router.get("/profile", getRecruiterProfile);
router.put("/profile", updateRecruiterProfile);

module.exports = router;