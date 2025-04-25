const express = require("express");
const router = express.Router();
const { scheduleDemo } = require("../controllers/demoController");

router.post("/schedule-demo", scheduleDemo);

module.exports = router;
