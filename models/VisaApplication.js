const mongoose = require("mongoose");
const validator = require("validator");

const visaApplicationSchema = new mongoose.Schema(
    {
        candidate: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "Candidate ID is required"], 
            unique: true 
        },
        recruiter: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "Recruiter ID is required"] 
        },
        visaType: { 
            type: String, 
            required: [true, "Visa type is required"], 
            trim: true, 
            maxlength: [50, "Visa type cannot exceed 50 characters"] 
        },
        expirationDate: { 
            type: Date, 
            required: [true, "Expiration date is required"] 
        },
        status: { 
            type: String, 
            enum: ["Pending", "Approved", "Rejected", "Expired"], 
            default: "Pending" 
        },
        documents: [{ 
            type: String, 
            validate: [validator.isURL, "Please provide a valid URL for the document"] 
        }],
        notes: { 
            type: String, 
            maxlength: [500, "Notes cannot exceed 500 characters"] 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("VisaApplication", visaApplicationSchema);