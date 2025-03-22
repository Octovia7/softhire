const express = require("express");
const { signup, verifyOTP, login, logout, forgotPassword, resetPassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Public Routes
router.post("/signup", signup);          // Send OTP
router.post("/verify-otp", verifyOTP);   // Verify OTP
router.post("/login", login);            // Login
router.post("/logout", logout);          // Logout
router.post("/forgot-password", forgotPassword); // Forgot password
router.post("/reset-password", resetPassword);   // Reset password

// ✅ Protected Route (requires JWT)
router.get("/dashboard", authenticate, (req, res) => {
    res.json({ message: `Welcome back, ${req.user.email}!` });
});

module.exports = router;