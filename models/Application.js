const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        resume: { type: String, required: true }, // Resume URL
        coverLetter: { type: String },
        status: { 
            type: String, 
            enum: ["Pending", "Accepted", "Rejected"], 
            default: "Pending" 
        },
        appliedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
