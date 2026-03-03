const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { create } = require("connect-mongo");
const jwt = require("jsonwebtoken");
const Recruiter = require("../models/Recruiter"); // <-- Add this line at top
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
    const email = payload.email;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        email: email,
        fullName: payload.name || `${payload.given_name} ${payload.family_name}` || "Google User",
        avatar: payload.picture || null,
        googleId: payload.sub,
        isOAuthUser: true,
        isVerified: true,
        role: role,
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in HTTP-only cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None", // or "None" if cross-site and using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: user.isNew ? "User created via Google" : "Login successful",
      user,
    });

  } catch (error) {
    console.error("Google login failed:", error);
    return res.status(500).json({ message: "Google login failed", error: error.message });
  }
};

// Use aggregation pipeline to return user data with their organization populated


const submitRecruiterDetails = async (req, res) => {
  const { userId, organizationName, website, industry } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "recruiter") {
      return res.status(403).json({ message: "User is not a recruiter" });
    }

    const existingOrganization = await Organization.findOne({ createdBy: user._id });
    if (existingOrganization) {
      return res.status(400).json({ message: "User already has an organization" });
    }

    // Create new organization
    const newOrganization = await Organization.create({
      name: organizationName,
      website: website,
      industry: industry,
      createdBy: user._id
    });

    // Create Recruiter profile
    const existingRecruiter = await Recruiter.findOne({ userId: user._id });
    if (!existingRecruiter) {
      await Recruiter.create({
        userId: user._id,
        organization: newOrganization._id,
        companyName: organizationName,
        website: website,
        position: "Recruiter"
      });
    }

    await user.save();

    // Use aggregation pipeline to get user with organization data
    const userWithOrg = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: "organizations",
          localField: "organization",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      { $limit: 1 }
    ]);

    return res.status(200).json({
      message: "Recruiter details updated successfully",
      user: userWithOrg[0],
    });

  } catch (error) {
    console.error("Error updating recruiter details:", error);
    return res.status(500).json({ message: "Error updating recruiter details", error: error.message });
  }
};



module.exports = { googleLogin, submitRecruiterDetails };
