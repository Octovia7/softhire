// models/Organization.js
const mongoose = require("mongoose");
const validator = require("validator");

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
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);