// models/Education.js
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: String, required: true },
  graduationYear: { type: String }, // or Number if always a year
  degreeType: { type: String },
  majors: [{ type: String }],
  gpa: { type: String }, // or Number
}, { timestamps: true });

module.exports = mongoose.model("Education", educationSchema);
