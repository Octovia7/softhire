// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  permissions: {
    type: [String], // e.g., ['approve_orgs', 'view_visas']
    default: []
  },
  level: {
    type: String,
    enum: ['superadmin', 'moderator'],
    default: 'moderator'
  }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
