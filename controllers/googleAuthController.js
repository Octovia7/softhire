const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Google OAuth Callback
const googleAuthCallback = async (req, res) => {
  const user = req.user;

  if (!user || !user._id) {
    return res.status(400).json({ error: "User authentication failed" });
  }

  if (user.needsRoleSelection) {
    return res.json({ message: "Please select a role", userId: user._id });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({ message: "Login successful", token });
};

// Set user role after Google OAuth
const setUserRole = async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: "User ID and role are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = role;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ message: "Role assigned successfully", token });
  } catch (err) {
    console.error("Error setting role:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { googleAuthCallback, setUserRole };
