// routes/adminAuth.js

const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminAuthController'); // or adminAuthController if you separated it

// Admin login route
router.post('/login', adminLogin);

module.exports = router;
