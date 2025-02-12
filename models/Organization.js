const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        website: { type: String }, // Optional company website
        industry: { type: String }, // e.g., IT, Healthcare, Finance

        sponsorLicense: { type: String, required: true }, // Mandatory for compliance
        complianceDocs: [
            {
                docType: { type: String }, // e.g., "Tax Certificate", "Business License"
                url: { type: String, required: true }, // Link to document storage
            },
        ],

        location: {
            address: { type: String },
            city: { type: String },
            country: { type: String },
        },

        recruiters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        jobListings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], // Track job postings

    },
    { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);

