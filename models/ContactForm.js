const mongoose = require("mongoose");

const contactFormSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  countryCode: {
    type: String,
    required: true,
    default: "+44"
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ContactForm", contactFormSchema);