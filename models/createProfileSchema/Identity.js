const mongoose = require("mongoose");

const identitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  pronouns: { type: String },
  showPronouns: { type: Boolean, default: false },
  gender: { type: String },
  raceEthnicity: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Identity", identitySchema);
