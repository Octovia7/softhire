const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
        recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Recruiter who posted the job

        jobType: { 
            type: String, 
            enum: ["Full-time", "Part-time", "Internship", "Contract"], 
            required: true 
        },

        location: {
            city: String,
            country: String,
            remote: { type: Boolean, default: false },
        },

        salary: {
            min: { type: Number },
            max: { type: Number },
            currency: { type: String, default: "USD" },
        },

        skillsRequired: [{ type: String }], // Skills like "JavaScript", "Node.js", "MongoDB"
        experienceLevel: { 
            type: String, 
            enum: ["Entry", "Mid", "Senior"], 
            required: true 
        },

        applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }], // Applied users
        applicationDeadline: { type: Date, required: true },

        status: { 
            type: String, 
            enum: ["Open", "Closed", "Filled"], 
            default: "Open" 
        }, // Helps track job availability

    },
    { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
