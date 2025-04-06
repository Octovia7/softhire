const mongoose = require("mongoose");

const consultRequestSchema = new mongoose.Schema({
    email: { type: String, required: true },
    companyName: { type: String, required: true },
    firstName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    numberOfEmployees: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    numberOfSponsoredEmployees: { type: String, required: true },
    goals: { type: [String], required: true },
    hearAboutUs: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("ConsultRequest", consultRequestSchema);
