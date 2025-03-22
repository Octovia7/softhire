const mongoose = require("mongoose");
const validator = require("validator");

const jobSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: [true, "Job title is required"], 
            trim: true, 
            maxlength: [100, "Job title cannot exceed 100 characters"] 
        },
        description: { 
            type: String, 
            required: [true, "Job description is required"], 
            maxlength: [1000, "Job description cannot exceed 1000 characters"] 
        },
        company: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Organization", 
            required: [true, "Company ID is required"] 
        },
        recruiter: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "Recruiter ID is required"] 
        },
        jobType: { 
            type: String, 
            enum: ["Full-time", "Part-time", "Internship", "Contract"], 
            required: [true, "Job type is required"] 
        },
        location: {
            city: { 
                type: String, 
                trim: true, 
                maxlength: [50, "City name cannot exceed 50 characters"] 
            },
            country: { 
                type: String, 
                trim: true, 
                maxlength: [50, "Country name cannot exceed 50 characters"] 
            },
            remote: { 
                type: Boolean, 
                default: false 
            },
        },
        salary: {
            min: { 
                type: Number, 
                min: [0, "Minimum salary cannot be negative"] 
            },
            max: { 
                type: Number, 
                min: [0, "Maximum salary cannot be negative"] 
            },
            currency: { 
                type: String, 
                default: "USD" 
            },
        },
        skillsRequired: [{ 
            type: String, 
            maxlength: [50, "Skill cannot exceed 50 characters"] 
        }],
        experienceLevel: { 
            type: String, 
            enum: ["Entry", "Mid", "Senior"], 
            required: [true, "Experience level is required"] 
        },
        applications: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Application" 
        }],
        applicationDeadline: { 
            type: Date, 
            required: [true, "Application deadline is required"] 
        },
        status: { 
            type: String, 
            enum: ["Open", "Closed", "Filled"], 
            default: "Open" 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);