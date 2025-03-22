const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, "Organization name is required"], 
            trim: true, 
            maxlength: [100, "Organization name cannot exceed 100 characters"] 
        },
        website: { 
            type: String, 
            validate: [validator.isURL, "Please provide a valid URL"] 
        },
        industry: { 
            type: String, 
            trim: true, 
            maxlength: [50, "Industry cannot exceed 50 characters"] 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
module.exports = mongoose.model("Organization", organizationSchema);

