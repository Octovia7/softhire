const mongoose = require("mongoose");

const skilledWorkerSchema = new mongoose.Schema({
  socCode: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  relatedJobs: {
    type: [String],
    required: true,
  },
  iscExempt: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("SkilledWorkerOccupation", skilledWorkerSchema);
