const mongoose = require('mongoose');

const jobExpectationsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  jobDescription: { type: String, required: true },
  workEnvironment: {
    type: String,
    enum: [
      'Structured (clear roles, feedback)',
      'Flexible (figure things out on your own)'
    ],
    required: true
  },
  importantFactors: {
    type: [String],
    enum: [
      'Having a say in what I work on and how I work',
      'Opportunities to progress within the company',
      'Team members I can learn from',
      'A company with a good growth trajectory',
      'Having a say in the company\'s and/or my team\'s direction',
      'Mentorship opportunities',
      'Learn new things and develop my skills',
      'Challenging problems to work on',
      'A diverse team'
    ],
    validate: [arr => arr.length <= 2, 'Max 2 selections allowed']
  },
  flexibleRemoteImportance: {
    type: String,
    enum: ['Very important', 'Important', 'Not important'],
    required: true
  },
  quietOfficeImportance: {
    type: String,
    enum: ['Very important', 'Important', 'Not important'],
    required: true
  },
  interestedMarkets: [{ type: String }],
  notInterestedMarkets: [{ type: String }]
});

module.exports = mongoose.model('JobExpectations', jobExpectationsSchema);
