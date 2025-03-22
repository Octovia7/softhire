const mongoose = require("mongoose");
const validator = require("validator");

const recruiterSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "User ID is required"], 
            unique: true 
        },
        organization: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Organization", 
            required: [true, "Organization ID is required"] 
        },
        companyName: { 
            type: String, 
            required: [true, "Company name is required"], 
            trim: true, 
            maxlength: [100, "Company name cannot exceed 100 characters"] 
        },
        website: { 
            type: String, 
            validate: [validator.isURL, "Please provide a valid URL"] 
        },
        position: { 
            type: String, 
            trim: true, 
            maxlength: [50, "Position cannot exceed 50 characters"] 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Recruiter", recruiterSchema);