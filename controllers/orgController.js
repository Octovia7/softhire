const Job = require('../models/Job');
const mongoose = require('mongoose');

// controllers/applicationController.js
const Application = require('../models/Application');
// controllers/applicationController.js
// const Application = require('../models/Application');
// const Job = require('../models/Job');

exports.getApplicationsForOrg = async (req, res) => {
  try {
    const orgId = req.organization._id;

    // Step 1: Get job IDs posted by this organization
    const jobs = await Job.find({ organization: orgId }, '_id');
    const jobIds = jobs.map(job => job._id);

    // Step 2: Get applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('candidate', 'name email')   // optional, populate candidate info
      .populate('job', 'title visaType');    // optional, populate job info

    res.status(200).json(applications);
  } catch (err) {
    console.error('Error fetching applications for org:', err);
    res.status(500).json({ error: 'Server error while fetching applications' });
  }
};


exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Submitted', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: `Application status updated to ${status}`, application });
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Server error while updating application status' });
  }
};


// ✅ Create a new job
exports.createJob = async (req, res) => {
  try {
    const user = req.user;

    if (!req.organization) {
      return res.status(403).json({ error: 'Only organization users can post jobs.' });
    }

    const { visaType, ...otherFields } = req.body;

    if (!visaType) {
      return res.status(400).json({ error: 'visaType is required when posting a job.' });
    }

    const newJob = new Job({
      ...otherFields,
      visaType,
      postedBy: user._id,
      organization: req.organization._id,
    });

    await newJob.save();

    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Server error while creating job' });
  }
};

// ✅ Update an existing job
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, organization: req.organization._id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized.' });
    }

    // Prevent changing visaType after creation
    if (req.body.visaType && req.body.visaType !== job.visaType) {
      return res.status(400).json({ error: 'Changing visaType is not allowed once the job is created.' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ error: 'Server error while updating job' });
  }
};



exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid jobId format.' });
    }

    const job = await Job.findOneAndUpdate(
      { _id: jobId, organization: req.organization._id },
      { active: false },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized.' });
    }

    res.status(200).json({ message: 'Job deactivated successfully', job });
  } catch (err) {
    console.error('Error deactivating job:', err);
    res.status(500).json({ error: 'Server error while deactivating job' });
  }
};
// ✅ Get all jobs by this organization
exports.listJobsByOrg = async (req, res) => {
  try {
    const orgId = req.organization._id;

    const jobs = await Job.find({ organization: orgId }).sort({ postedAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Server error while fetching jobs' });
  }
};

// ✅ Get one specific job by this organization
exports.getOrgJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const orgId = req.organization._id;

    const job = await Job.findOne({ _id: jobId, organization: orgId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    res.status(200).json(job);
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ error: 'Server error while fetching job' });
  }
};
