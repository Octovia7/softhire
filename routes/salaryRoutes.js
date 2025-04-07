// routes/salaryRoutes.js
const express = require("express");
const {
  searchSalary,
  getSalaryDetails
} = require("../controllers/salaryController");

const router = express.Router();

router.get("/search", searchSalary); // GET /api/salary/search?keyword=software
router.get("/details", getSalaryDetails); // GET /api/salary/details/2136

module.exports = router;
