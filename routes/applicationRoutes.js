// routes/applicationRoutes.js

const express = require('express');
const router = express.Router();
const { submitApplication , getMyApplications} = require('../controllers/applicationController');
const {authenticate} = require('../middleware/authMiddleware');

router.post('/apply', authenticate, submitApplication); // Candidate applies to a job
router.get('/my',authenticate,getMyApplications);

module.exports = router;
