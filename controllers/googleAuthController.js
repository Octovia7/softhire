const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // console.log("Google Payload:", payload);

    const existingUser = await User.findOne({ email: payload.email });

    if (existingUser) {
      return res.status(200).json({
        message: "Login successful",
        user: existingUser,
      });
    }

    // Create new OAuth user
    const newUser = await User.create({
      email: payload.email,
      fullName: payload.name || `${payload.given_name} ${payload.family_name}` || "Google User",
      avatar: payload.picture || null,
      googleId: payload.sub,
      isOAuthUser: true,
      isVerified: true,
      role: "candidate" // Default role (you can change this logic)
    });

    return res.status(201).json({
      message: "User created via Google",
      user: newUser,
    });
  } catch (error) {
    console.error("Google login failed:", error);
    return res.status(500).json({ message: "Google login failed", error: error.message });
  }
};


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

module.exports = { googleAuthCallback, setUserRole, googleLogin };
