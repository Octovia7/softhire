// controllers/educationController.js

const Education = require("../../models/createProfileSchema/Education");

exports.addEducation = async (req, res) => {
  try {
    const { school, graduationYear, degreeType, majors, gpa } = req.body;

    const newEducation = new Education({
      userId: req.user.id,
      school,
      graduationYear,
      degreeType,
      majors: majors || [],
      gpa
    });

    await newEducation.save();

    res.status(201).json({ message: "Education added", data: newEducation });
  } catch (err) {
    console.error("Add education error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
