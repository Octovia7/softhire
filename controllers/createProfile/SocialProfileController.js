// controllers/socialProfileController.js

const SocialProfile = require("../../models/createProfileSchema/SocialProfile");

exports.upsertSocialProfile = async (req, res) => {
  try {
    const { website, linkedIn, github, twitter } = req.body;

    const existing = await SocialProfile.findOne({ userId: req.user.id });

    if (existing) {
      existing.website = website || "";
      existing.linkedIn = linkedIn || "";
      existing.github = github || "";
      existing.twitter = twitter || "";
      await existing.save();
      return res.status(200).json({ message: "Social profile updated", data: existing });
    }

    const newProfile = new SocialProfile({
      userId: req.user.id,
      website,
      linkedIn,
      github,
      twitter,
    });

    await newProfile.save();

    res.status(201).json({ message: "Social profile created", data: newProfile });
  } catch (error) {
    console.error("Social profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
