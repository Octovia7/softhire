const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
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
        recruiter: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "Recruiter ID is required"] 
        },
        date: { 
            type: Date, 
            required: [true, "Interview date is required"] 
        },
        meetingLink: { 
            type: String, 
            required: [true, "Meeting link is required"], 
            validate: [validator.isURL, "Please provide a valid URL for the meeting link"] 
        },
        status: { 
            type: String, 
            enum: ["Scheduled", "Completed", "Cancelled"], 
            default: "Scheduled" 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
