const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: Date, required: true },
        meetingLink: { type: String, required: true },
        status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
