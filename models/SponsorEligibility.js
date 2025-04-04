const mongoose = require("mongoose");

const sponsorEligibilitySchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        isUKRegistered: {
            type: String,
            enum: ["Yes", "No - Foreign Company", "No - Planning to Register"],
            required: true,
        },
        documentsSubmitted: {
            type: [String],
            required: true,
            default: [],
        },
        jobRole: {
            type: String,
            required: true,
        },
        jobCode: {
            type: String,
            required: true,
        },
        salaryOffered: {
            type: Number,
            required: true,
        },
        salaryMeetsRequirement: {
            type: Boolean,
            default: false,
        },
        authorizingOfficerAvailable: {
            type: String,
            enum: ["Yes", "No", "Need More Information"],
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("SponsorEligibility", sponsorEligibilitySchema);
