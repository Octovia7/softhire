const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Passport', 'eVisa', 'Proof of English', 'Police Check', 'TB Certificate'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

documentSchema.index({ candidate: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Document', documentSchema);
