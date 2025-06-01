const Profile = require("../models/Profile");
const cloudinary = require("../utils/cloudinary"); // Correct import
const mongoose = require("mongoose");
const User = require("../models/User");


const ProfileImage = require('../models/ProfileImage');
const asyncHandler = require('express-async-handler');
const JobPreferences = require('../models/JobPreferences');
const JobExpectations = require('../models/JobExpectations');
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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


exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profileData = await Profile.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'profileimages',
          let: { userId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'profileImageDoc'
        }
      },
      { $unwind: { path: '$profileImageDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          primaryRole: 1,
          yearsOfExperience: 1,
          openToRoles: 1,
          bio: 1,
          socialProfiles: 1,
          workExperience: 1,
          education: 1,
          skills: 1,
          achievements: 1,
          identity: 1,
          createdAt: 1,
          updatedAt: 1,
          profileImage: '$profileImageDoc.imageUrl',
          user: {
            _id: '$user._id',
            fullName: '$user.fullName',
            email: '$user.email',
            avatar: '$user.avatar',
            role: '$user.role',
            isOAuthUser: '$user.isOAuthUser',
            isVerified: '$user.isVerified',
            createdAt: '$user.createdAt',
            updatedAt: '$user.updatedAt'
          }
        }
      }
    ]);

    if (!profileData || profileData.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Organize the response
    const p = profileData[0];
    const response = {
      _id: p._id,
      name: p.name,
      location: p.location,
      primaryRole: p.primaryRole,
      yearsOfExperience: p.yearsOfExperience,
      openToRoles: p.openToRoles,
      bio: p.bio,
      socialProfiles: p.socialProfiles,
      workExperience: p.workExperience,
      education: p.education,
      skills: p.skills,
      achievements: p.achievements,
      identity: p.identity,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      profileImage: p.profileImage || null,
      user: p.user
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// exports.getProfile = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const profile = await Profile.findById(id).lean();
//   if (!profile) {
//     return res.status(404).json({ error: 'Profile not found' });
//   }

//   const jobPreferences = await JobPreferences.findOne({ userId: profile.userId }).lean();
//   const jobExpectations = await JobExpectations.findOne({ userId: profile.userId }).lean();

//   const fullProfile = {
//     ...profile,
//     jobPreferences: jobPreferences || {},
//     jobExpectations: jobExpectations || {},
//   };

//   res.status(200).json(fullProfile);
// });



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


exports.searchApplicants = asyncHandler(async (req, res) => {
  const { search, role, location, experience, skill, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { bio: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (role) {
    query.openToRoles = { $regex: escapeRegex(role), $options: 'i' };
  }

  if (location) {
    query.location = { $regex: escapeRegex(location), $options: 'i' };
  }

  if (experience) {
    query.yearsOfExperience = { $regex: escapeRegex(experience), $options: 'i' };
  }

  if (skill) {
    query.skills = { $elemMatch: { $regex: escapeRegex(skill), $options: 'i' } };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const applicants = await Profile.find(query)
    .select('name location yearsOfExperience openToRoles skills jobPreferences')
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Profile.countDocuments(query);

  res.status(200).json({
    total,
    page: Number(page),
    limit: Number(limit),
    applicants,
  });
});
