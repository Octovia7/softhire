// routes/admin.js or similar
const express = require('express');
const router = express.Router();
const {
  getPendingOrganizations,
  approveOrganization,
  rejectOrganization,
  getOrganizationsByStatus
} = require('../controllers/adminOrganizationController');

const authorizeAdmin = require('../middleware/authorizeAdmin');

// Protect all routes below with admin middleware
router.get('/organizations/pending', authorizeAdmin, getPendingOrganizations);
router.post('/organizations/:id/approve', authorizeAdmin, approveOrganization);
router.post('/organizations/:id/reject', authorizeAdmin, rejectOrganization);
router.get('/organizations', authorizeAdmin, getOrganizationsByStatus);

module.exports = router;
