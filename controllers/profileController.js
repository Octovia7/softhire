const Profile = require("../models/Profile");
const cloudinary = require("../utils/cloudinary"); // Correct import

const ProfileImage = require('../models/ProfileImage');

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profilePhotos",
    }); 

    const existing = await ProfileImage.findOne({ userId: req.user.id });

    if (existing) {
      // Optional: delete old image from Cloudinary
      if (existing.publicId) {
        await cloudinary.uploader.destroy(existing.publicId);
      }
      existing.imageUrl = result.secure_url;
      existing.publicId = result.public_id;
      await existing.save();
      return res.status(200).json({ message: "Profile image updated", image: existing });
    }

    const newImage = new ProfileImage({
      userId: req.user.id,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    await newImage.save();

    return res.status(201).json({ message: "Profile image uploaded", image: newImage });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


// const ProfileImage = require('../models/ProfileImage');

exports.createProfile = async (req, res) => {
  try {
    const {
      name,
      location,
      primaryRole,
      yearsOfExperience,
      openToRoles,
      bio,
      socialProfiles,
      workExperience,
      education,
      skills,
      achievements,
      identity,
    } = req.body;

    const imageDoc = await ProfileImage.findOne({ userId: req.user.id });

    const fieldsToParse = {
      openToRoles,
      socialProfiles,
      workExperience,
      education,
      skills,
      achievements,
      identity,
    };

    const parsedData = {};
    for (const [key, value] of Object.entries(fieldsToParse)) {
      parsedData[key] =
        typeof value === "string"
          ? JSON.parse(value || "null") || []
          : value || [];
    }

    const newProfile = new Profile({
      userId: req.user.id,
      profileImage: imageDoc?._id || null,
      name,
      location,
      primaryRole,
      yearsOfExperience,
      bio,
      ...parsedData,
    });

    await newProfile.save();

    res.status(201).json({
      message: "Profile created",
      profile: newProfile,
    });
  } catch (err) {
    console.error("Profile creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// GET Profile by ID
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE Profile by ID
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 🛡️ Only the owner can update
    if (profile.userId.toString() !== req.user.id) {  // ✅ Use userId
      return res.status(403).json({ error: "Access denied. You can only update your own profile." });
    }

    const updatedData = req.body;

    const updatedProfile = await Profile.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE Profile by ID
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 🛡️ Only the owner can delete
    if (profile.userId.toString() !== req.user.id) {  // ✅ Use userId
      return res.status(403).json({ error: "Access denied. You can only delete your own profile." });
    }

    await Profile.findByIdAndDelete(id);

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;  // Extracted from JWT by auth middleware

    const profileImage = await ProfileImage.findOne({ userId });

    if (!profileImage) {
      return res.status(404).json({ error: "Profile image not found" });
    }

    res.status(200).json(profileImage);
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ error: "Server error" });
  }
};

