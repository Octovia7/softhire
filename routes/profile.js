const express = require("express")
const router = express.Router();
const upload = require('../utils/multer');

const { authenticate } = require('../middleware/authMiddleware');

const { 
    createProfile,
    getProfile,
    updateProfile,
    deleteProfile, 
    uploadProfileImage,
    getProfileImage,
    searchApplicants,
    getCurrentUserProfile, // New function
    updateCurrentUserProfile // New function
} = require('../controllers/profileController');

// Get current user's profile image
router.get("/profile-image", authenticate, getProfileImage);

// Upload profile photo
router.post('/upload-photo', authenticate, upload.single('profilePhoto'), uploadProfileImage);

// Get current authenticated user's profile (no ID needed)
router.get("/me", authenticate, getCurrentUserProfile);

// Update current authenticated user's profile (no ID needed)
router.patch("/me", authenticate, updateCurrentUserProfile);

// Create profile for current user
router.post('/', authenticate, createProfile);

// Search applicants (public route for recruiters)
router.get('/search-applicants', searchApplicants);

// Get profile by user ID (public or protected based on your needs)
router.get("/:id", getProfile);

// Update profile by ID (only owner can update)
router.patch("/:id", authenticate, updateProfile);

// Delete profile by ID (only owner can delete)
router.delete("/:id", authenticate, deleteProfile);

module.exports = router;
