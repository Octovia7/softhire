// routes/applicationRoutes.js

const express = require('express');
const router = express.Router();
const { submitApplication } = require('../controllers/applicationController');
const {authenticate} = require('../middleware/authMiddleware');

router.post('/apply', authenticate, submitApplication); // Candidate applies to a job

module.exports = router;
