// models/WorkExperience.js
const mongoose = require("mongoose");

const workExperienceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: String, required: true },
  title: { type: String, required: true },
  startDate: { type: String, required: true }, // consider using Date if not using MM/YYYY
  endDate: { type: String },
  currentlyWorking: { type: Boolean, default: false },
  description: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("WorkExperience", workExperienceSchema);
