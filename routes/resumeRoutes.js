// routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const { uploadResume, getResume, deleteResume } = require('../controllers/resumeController');
const uploadResumemulter = require('../utils/resumeMulter');
const { authenticate } = require('../middleware/authMiddleware');

console.log('📁 Resume routes loading...');

// ✅ FIXED: Use root paths since mounting is done in server.js
router.patch('/', authenticate, uploadResumemulter.single('resume'), uploadResume);
router.get('/', authenticate, getResume);
router.delete('/', authenticate, deleteResume); // ✅ Add delete route

console.log('✅ Resume routes loaded successfully');

module.exports = router;

