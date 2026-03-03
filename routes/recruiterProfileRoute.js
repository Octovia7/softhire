const express = require("express");
const router = express.Router();
const recruiterController = require("../controllers/recruiterProfileController");
const isVerifiedOrg = require('../middleware/isVerifiedOrg');
const { authenticate } = require('../middleware/authMiddleware');
router.get("/profile", authenticate,isVerifiedOrg,recruiterController.getRecruiterByOrg);
router.patch("/profile", authenticate,isVerifiedOrg,recruiterController.upsertRecruiter);

module.exports = router;
