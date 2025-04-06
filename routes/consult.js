const express = require("express");
const router = express.Router();
const { submitConsultForm } = require("../controllers/consultController");

router.post("/consult/book", submitConsultForm);

module.exports = router;
