const express = require("express");
const { submitSponsorAssessment} = require("../controllers/sponsorEligibilityController");

const { authenticate, authorizeRecruiter } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/assessment", authenticate, authorizeRecruiter, submitSponsorAssessment);
// router.post("/submit", submitSponsorAssessment);
// router.get("/all", getAllAssessments);

module.exports = router;
