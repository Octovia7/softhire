const express = require("express");
const router = express.Router();
const { estimateLicenceFee } = require("../controllers/sponsorLicenceController");

router.post("/estimate-sponsor-licence-fee", estimateLicenceFee);

module.exports = router;
