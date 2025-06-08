// models/Skills.js
const mongoose = require("mongoose");

const skillsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Skills", skillsSchema);
