const mongoose = require("mongoose");
const validator = require("validator"); // For email validation

const userSchema = new mongoose.Schema(
    {
        fullName: { 
            type: String, 
            trim: true, 
            maxlength: [100, "Full name cannot exceed 100 characters"],
            required: function () {
                return !this.isOAuthUser; // Required only for non-OAuth users
            }
        },
        email: { 
            type: String, 
            required: [true, "Email is required"], 
            unique: true, 
            trim: true, 
            lowercase: true, 
            validate: [validator.isEmail, "Please provide a valid email"] 
        },
        password: { 
            type: String, 
            minlength: [8, "Password must be at least 8 characters long"],
            default: null,
            required: function () {
                return !this.isOAuthUser; // Required only for non-OAuth users
            }
        },
        googleId: { 
            type: String, 
            unique: true, 
            sparse: true // Allows unique but also allows null
        },
        avatar: { 
            type: String, 
            default: null // Store Google profile picture URL
        },
        role: { 
            type: String, 
            enum: ["candidate", "recruiter", "admin"], 
            required: function () {
                return !this.isOAuthUser; // Required only for non-OAuth users
            }
        },
        isOAuthUser: { 
            type: Boolean, 
            default: false // True if user registered via Google
        },
        isVerified: { 
            type: Boolean, 
            default: false 
        },
        otpData: {
            otp: { type: String, default: null },
            otpExpires: { type: Date, default: null },
            otpAttempts: { type: Number, default: 0, min: [0, "OTP attempts cannot be negative"] },
            otpVerified: { type: Boolean, default: false },
        },
        passwordReset: {
            resetPasswordToken: { type: String, default: null },
            resetPasswordExpires: { type: Date, default: null },
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

