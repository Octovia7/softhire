const mongoose = require("mongoose");
const validator = require("validator");

const applicationSchema = new mongoose.Schema(
    {
        job: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Job", 
            required: [true, "Job ID is required"] 
        },
        candidate: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "Candidate ID is required"] 
        },
        resume: { 
            type: String, 
            required: [true, "Resume URL is required"], 
            validate: [validator.isURL, "Please provide a valid URL for the resume"] 
        },
        coverLetter: { 
            type: String, 
            maxlength: [1000, "Cover letter cannot exceed 1000 characters"] 
        },
        status: { 
            type: String, 
            enum: ["Pending", "Accepted", "Rejected"], 
            default: "Pending" 
        },
        appliedAt: { 
            type: Date, 
            default: Date.now 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);