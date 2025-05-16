const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Organization = require("../models/Organization");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;

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

    if(existingUser.role === "recruiter" ) {
      return res.status(403).json({ message: "Access denied. Recruiters are not allowed to log in." });
    }

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
      role: role,
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

const submitRecruiterDetails = async (req, res) => {
  const { userId, organizationName, website, industry } = req.body;
  try {
    console.log(req.body);
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update the user with the new details
    const newOrganization = await Organization.create({
      name: organizationName,
      website: website,
      industry: industry,
    });
    user.organization = newOrganization._id;
    await user.save();
    return res.status(200).json({ message: "Recruiter details updated successfully", user });
  }
  catch (error) {
    console.error("Error updating recruiter details:", error);
    return res.status(500).json({ message: "Error updating recruiter details", error: error.message });
  }
}


module.exports = { googleLogin, submitRecruiterDetails };
