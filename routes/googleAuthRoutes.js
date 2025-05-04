const express = require("express");
const passport = require("passport");
const { googleAuthCallback, setUserRole, googleLogin } = require("../controllers/googleAuthController");

const router = express.Router();

// Debugging: Check if functions are correctly imported
console.log("googleAuthCallback:", typeof googleAuthCallback);
console.log("setUserRole:", typeof setUserRole);

// ✅ Start Google Authentication
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Handle OAuth Callback
router.get(
    "/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    googleAuthCallback
);

// ✅ Set Role after Signup
router.post("/set-role", setUserRole);
router.post('/google-login', googleLogin); // This route is for Google login, not signup

module.exports = router;
