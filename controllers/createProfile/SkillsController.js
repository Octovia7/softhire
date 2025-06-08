// controllers/skillsController.js

const Skills = require("../../models/createProfileSchema/Skills");

exports.addSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: "Skills must be an array" });
    }

    const updatedSkills = await Skills.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { skills } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Skills updated", data: updatedSkills });
  } catch (err) {
    console.error("Add skills error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
