const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "User ID is required"], 
            unique: true 
        },
        permissions: [{ 
            type: String, 
            enum: ["manage-users", "manage-jobs", "view-reports"] 
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);