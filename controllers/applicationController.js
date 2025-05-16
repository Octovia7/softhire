const Application = require('../models/Application');
const Candidate = require('../models/Candidate');

const submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter = '' } = req.body;
    const userId = req.user.id;

    // Check if already applied
    const existing = await Application.findOne({ candidate: userId, job: jobId });
    if (existing) {
      return res.status(400).json({ message: 'You already applied for this job.' });
    }

    // Ensure candidate has resume
    const candidateProfile = await Candidate.findOne({ userId: userId }); // Updated to use userId
    if (!candidateProfile || !candidateProfile.resume) {
      return res.status(400).json({ message: 'Candidate profile or resume not found.' });
    }

    // Create application
    const application = await Application.create({
      candidate: userId,
      job: jobId,
      coverLetter
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {submitApplication};
