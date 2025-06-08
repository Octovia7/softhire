const About = require("../../models/createProfileSchema/About");

exports.about = async (req, res) => {
  try {
    const {
      name,
      location,
      primaryRole,
      yearsOfExperience,
      openToRoles,
      bio
    } = req.body;

    // Validate required fields
    if (!name || !location || !primaryRole || !yearsOfExperience || !openToRoles || !bio) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const parsedOpenToRoles = typeof openToRoles === 'string'
      ? openToRoles.split(',').map(role => role.trim())
      : openToRoles;

    const about = new About({
      userId: req.user.id,
      name,
      location,
      primaryRole,
      yearsOfExperience,
      openToRoles: parsedOpenToRoles,
      bio
    });

    await about.save();

    res.status(201).json({
      message: "Profile created successfully",
      about
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
