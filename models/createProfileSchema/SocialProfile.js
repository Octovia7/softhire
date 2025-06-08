// models/SocialProfile.js
const mongoose = require("mongoose");

const socialProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  website: { type: String, default: "" },
  linkedIn: { type: String, default: "" },
  github: { type: String, default: "" },
  twitter: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("SocialProfile", socialProfileSchema);
