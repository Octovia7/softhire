// routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const uploadResume = require('../controllers/resumeController'); // Your controller
const uploadResumemulter = require('../utils/resumeMulter'); // Corrected import for Multer

const { authenticate } = require('../middleware/authMiddleware'); // 👈 import authenticate middleware


// POST /api/resume - Upload or update resume (protected route)
router.post('/', authenticate, uploadResumemulter.single('resume'), uploadResume);

module.exports = router;

