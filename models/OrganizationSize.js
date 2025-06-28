const mongoose = require("mongoose");

const OrganizationSizeSchema = new mongoose.Schema({
  turnover: {
    type: String,
    required: true,
    enum: ["below_15m", "15m_or_more"]
  },
  assets: {
    type: String,
    required: true,
    enum: ["below_7_5m", "7_5m_or_more"]
  },
  employees: {
    type: String,
    required: true,
    enum: ["below_50", "50_or_more"]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("OrganizationSize", OrganizationSizeSchema);
