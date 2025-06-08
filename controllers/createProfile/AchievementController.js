// controllers/achievementController.js

const Achievement = require("../../models/createProfileSchema/Achievement");

exports.addOrUpdateAchievement = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Achievement content is required" });
    }

    const updated = await Achievement.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { content } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Achievement saved", data: updated });
  } catch (err) {
    console.error("Achievement error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
