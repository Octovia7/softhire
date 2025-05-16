const express = require("express")
const router = express.Router();
const upload = require('../utils/multer');

const { authenticate } = require('../middleware/authMiddleware'); // 👈 import authenticate middleware

const { 
    createProfile,
    getProfile,
    updateProfile,
    deleteProfile, 
} = require('../controllers/profileController');

// 👇 Apply the authenticate middleware to routes that need protection

// POST Create Profile (only logged-in user can create)
router.post('/', authenticate, upload.single('profilePhoto'), createProfile);

// GET Profile (optional: protect it if you want only logged-in users to view)
// router.get("/:id", authenticate, getProfile); 

// or if profiles are public, no authenticate needed:
router.get("/:id", getProfile);

// PATCH Update Profile (only logged-in user)
router.patch("/:id", authenticate, updateProfile);

// DELETE Profile (only logged-in user)
router.delete("/:id", authenticate, deleteProfile);

module.exports = router;
