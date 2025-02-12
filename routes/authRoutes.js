const express = require("express");
const { signup, verifyOTP, login } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);          // Send OTP
router.post("/verify-otp", verifyOTP);   // Verify OTP
router.post("/login", login);            // Login

// Protected route (requires JWT)
router.get("/dashboard", authenticate, (req, res) => {
    res.json({ message: `Welcome back, ${req.user.email}!` });
});

module.exports = router;

