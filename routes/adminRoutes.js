const express = require("express");
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");
const {
    getAdminDashboard,
    getAllUsers,
    deleteUser,
    getAllJobs,
    deleteJob,
    getAllVisaApplications,
    updateVisaStatus,
    getUserDetails,
    updateUserDetails,
    getAnalytics
} = require("../controllers/adminController");

const router = express.Router();

// ✅ Middleware: Ensure only authenticated admins can access these routes
router.use(authenticate, authorizeAdmin);

// ✅ Admin Dashboard
router.get("/dashboard", getAdminDashboard);

// ✅ User Management
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.put("/users/:userId", updateUserDetails);
router.delete("/users/:userId", deleteUser);

// ✅ Job Management
router.get("/jobs", getAllJobs);
router.delete("/jobs/:jobId", deleteJob);

// ✅ Visa Management
router.get("/visa-applications", getAllVisaApplications);
router.put("/visa-applications/:applicationId", updateVisaStatus);

// ✅ Analytics
router.get("/analytics", getAnalytics);

module.exports = router;