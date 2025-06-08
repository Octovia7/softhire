// controllers/workExperienceController.js

const WorkExperience = require("../../models/createProfileSchema/WorkExperience");

exports.addWorkExperience = async (req, res) => {
  try {
    const { company, title, startDate, endDate, currentlyWorking, description } = req.body;

    const newExperience = new WorkExperience({
      userId: req.user.id,
      company,
      title,
      startDate,
      endDate: currentlyWorking ? null : endDate,
      currentlyWorking: !!currentlyWorking,
      description,
    });

    await newExperience.save();

    res.status(201).json({ message: "Work experience added", data: newExperience });
  } catch (err) {
    console.error("Add work experience error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
