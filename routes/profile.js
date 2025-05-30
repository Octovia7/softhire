const express = require("express")
const router = express.Router();
const upload = require('../utils/multer');

const { authenticate } = require('../middleware/authMiddleware'); // 👈 import authenticate middleware

const { 
    createProfile,
    getProfile,
    updateProfile,
    deleteProfile, 
    uploadProfileImage,
    getProfileImage,searchApplicants
} = require('../controllers/profileController');
// routes/profile.js or similar
router.get("/profile-image", authenticate, getProfileImage);
router.post('/upload-photo', authenticate, upload.single('profilePhoto'), uploadProfileImage);
// POST Create Profile (only logged-in user can create)
router.post('/', authenticate,  createProfile);
router.get('/search-applicants', searchApplicants);

// GET Profile (optional: protect it if you want only logged-in users to view)
// router.get("/:id", authenticate, getProfile); 

// or if profiles are public, no authenticate needed:
router.get("/:id", getProfile);

// PATCH Update Profile (only logged-in user)
router.patch("/:id", authenticate, updateProfile);

// DELETE Profile (only logged-in user)
router.delete("/:id", authenticate, deleteProfile);

module.exports = router;
