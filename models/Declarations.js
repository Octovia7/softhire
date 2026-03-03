const mongoose = require("mongoose");

const DeclarationsSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "SponsorshipApplication", required: true },
  serviceType: {
    type: String,
    enum: ["Standard", "Priority"],
    required: true,
  },
  canMeetSponsorDuties: { type: Boolean, required: true },
  agreesToTerms: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Declarations", DeclarationsSchema);
