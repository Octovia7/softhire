const mongoose = require("mongoose");

const scheduleDemoSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  organization: String,
  date: String,
  time: String,
  countryCode: String,
  phoneNumber: String,
  comments: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ScheduleDemo", scheduleDemoSchema);
