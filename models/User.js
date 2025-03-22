const mongoose = require("mongoose");
const validator = require("validator"); // For email validation

const userSchema = new mongoose.Schema(
    {
        fullName: { 
            type: String, 
            required: [true, "Full name is required"], 
            trim: true, 
            maxlength: [100, "Full name cannot exceed 100 characters"] 
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
            required: [true, "Password is required"], 
            minlength: [8, "Password must be at least 8 characters long"] 
        },
        role: { 
            type: String, 
            enum: ["candidate", "recruiter", "admin"], 
            required: [true, "Role is required"] 
        },
        isVerified: { 
            type: Boolean, 
            default: false 
        },
        otpData: {
            otp: { 
                type: String, 
                default: null 
            },
            otpExpires: { 
                type: Date, 
                default: null 
            },
            otpAttempts: { 
                type: Number, 
                default: 0, 
                min: [0, "OTP attempts cannot be negative"] 
            },
            otpVerified: { 
                type: Boolean, 
                default: false 
            },
        },
        passwordReset: {
            resetPasswordToken: { 
                type: String, 
                default: null 
            },
            resetPasswordExpires: { 
                type: Date, 
                default: null 
            },
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);