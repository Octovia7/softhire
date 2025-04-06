const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  occupationCode: String,
  jobType: String,
  relatedJobTitles: [String],
  standardRate: {
    annual: Number,
    hourly: Number,
  },
  lowerRate: {
    annual: Number,
    hourly: Number,
  },
});
SalarySchema.index({ jobType: 'text', occupationCode: 'text' ,relatedJobTitles: "text" });

module.exports = mongoose.model('Salary', SalarySchema);