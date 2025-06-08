const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");
const { about } = require("../../controllers/createProfile/AboutController");
const { addOrUpdateAchievement } = require("../../controllers/createProfile/AchievementController");
const { addEducation } = require("../../controllers/createProfile/EducationController");
const { updateIdentity } = require("../../controllers/createProfile/IdentityController");
const { addWorkExperience } = require("../../controllers/createProfile/WorkExperienceController");
const { addSkills } = require("../../controllers/createProfile/SkillsController");
const { upsertSocialProfile } = require("../../controllers/createProfile/SocialProfileController");

// Middleware to authenticate user (assumes you have an auth middleware)

// POST /profile/about - Create about section
router.post("/about", authenticate, about);

// POST /profile/achievement - Add or update achievement
router.post("/achievement", authenticate, addOrUpdateAchievement);

// POST /profile/education - Add education
router.post("/education", authenticate, addEducation);

// POST /profile/identity - Add or update identity
router.post("/identity", authenticate, updateIdentity);

router.post("/work-experience", authenticate, addWorkExperience);

router.post("/skills", authenticate, addSkills);

router.post("/socials" , authenticate, upsertSocialProfile)

module.exports = router;
