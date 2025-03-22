const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "User ID is required"], 
            unique: true 
        },
        skills: [{ 
            type: String, 
            maxlength: [50, "Skill cannot exceed 50 characters"] 
        }],
        resume: { 
            type: String, 
            validate: [validator.isURL, "Please provide a valid URL for the resume"] 
        },
        experience: { 
            type: Number, 
            default: 0, 
            min: [0, "Experience cannot be negative"], 
            max: [50, "Experience cannot exceed 50 years"] 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
module.exports = mongoose.model("Candidate", candidateSchema);
