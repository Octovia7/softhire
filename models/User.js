const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        role: { type: String, enum: ["candidate", "recruiter"], required: true },

        // For recruiters (linked organization)
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },

        // Candidate-specific profile
        profile: {
            skills: [{ type: String }],
            resume: { type: String }, // URL of uploaded resume
            experience: { type: Number, default: 0 }, // Years of experience
        },

        // Recruiter-specific details
        companyDetails: {
            companyName: { type: String },
            website: { type: String },
            position: { type: String }, // e.g., HR Manager, CTO
        },

        isVerified: { type: Boolean, default: false },

        // OTP handling
        otp: { type: String, default: null },
        otpExpires: { type: Date, default: null },

        // Password reset
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

