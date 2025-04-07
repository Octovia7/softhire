const express = require("express");
const router = express.Router();

const { calculateISC } = require("../controllers/iscController");

// POST route to calculate Immigration Skills Charge
router.post("/calculate", calculateISC);

module.exports = router;
