const mongoose = require("mongoose");

const OrganizationSizeSchema = new mongoose.Schema({
  turnover: {
    type: String,
    required: true,
  },
  assets: {
    type: String,
    required: true,
  },
  employees: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("OrganizationSize", OrganizationSizeSchema);
