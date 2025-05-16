const express = require("express");
const { googleLogin, submitRecruiterDetails } = require("../controllers/googleAuthController");

const router = express.Router();

router.post('/google-login', googleLogin); // This route is for Google login, not signup
router.post('/submit-recruiter-details', submitRecruiterDetails); // This route is for submitting recruiter details

module.exports = router;
