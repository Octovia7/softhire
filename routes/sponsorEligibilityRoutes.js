const express = require("express");
const { submitSponsorAssessment, getAllAssessments } = require("../controllers/sponsorEligibilityController");
const router = express.Router();

router.post("/submit", submitSponsorAssessment);
router.get("/all", getAllAssessments);

module.exports = router;
