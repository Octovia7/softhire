const mongoose = require("mongoose");

const OrganizationSizeSchema = new mongoose.Schema({
  turnoverBelow15M: { type: Boolean, required: true },
  assetsBelow7_5M: { type: Boolean, required: true },
  employeesBelow50: { type: Boolean, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("OrganizationSize", OrganizationSizeSchema);
