const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const {authenticate} = require('../middleware/authMiddleware');
const isVerifiedOrg = require('../middleware/isVerifiedOrg');
const uploadResumemulter = require('../utils/resumeMulter'); // Corrected import for Multer

// Candidate: Upload or update a document
router.post('/', authenticate, uploadResumemulter.single('document'),documentController.uploadOrUpdateProfileDocument);

// Candidate: View all their uploaded documents
router.get('/me', authenticate, documentController.getCandidateProfileDocuments);

// Candidate: Delete a specific document
router.delete('/:docId', authenticate, documentController.deleteProfileDocument);

// Org: View documents for a candidate's profile
router.get('/candidate/:candidateId', isVerifiedOrg, documentController.getDocumentsForCandidateProfile);

module.exports = router;
