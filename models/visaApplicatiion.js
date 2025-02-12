const mongoose = require("mongoose");

const visaApplicationSchema = new mongoose.Schema(
    {
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Assigned recruiter
        visaType: { type: String, required: true }, // e.g., H1B, Work Permit
        expirationDate: { type: Date, required: true },
        status: { type: String, enum: ["Pending", "Approved", "Rejected", "Expired"], default: "Pending" },
        documents: [{ type: String }], // URLs of uploaded visa documents
        notes: { type: String }, // Recruiter’s remarks
    },
    { timestamps: true }
);

module.exports = mongoose.model("VisaApplication", visaApplicationSchema);
