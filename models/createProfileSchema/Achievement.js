// models/Achievement.js
const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Achievement", achievementSchema);
