const mongoose = require("mongoose");

const AboutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  primaryRole: { type: String, required: true },
  yearsOfExperience: { type: String, required: true },
  openToRoles: { type: [String], required: true },
  bio: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("About", AboutSchema);
