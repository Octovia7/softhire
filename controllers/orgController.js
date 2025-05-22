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




// Update status of application (e.g., Saved, Rejected, Reviewed)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.statusUpdatedAt = new Date();
    await application.save();

    res.status(200).json({ message: `Status updated to ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get applications for a specific job, filtered by status
exports.getApplicationsByJobAndStatus = async (req, res) => {
  const { jobId } = req.params;
  const { status } = req.query;

  try {
    const filter = { job: jobId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('candidate', 'name email') // Adjust fields as needed
      .sort({ updatedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.createJob = async (req, res) => {
  try {
    const user = req.user;

    if (!req.organization) {
      return res.status(403).json({ error: 'Only organization users can post jobs.' });
    }

    console.log(req.body)

    const {
      title,
      jobDescription,
      jobType,
      primaryRole,
      additionalRoles,
      workExperience,
      skills,
      timeZones,
      location,
      relocationRequired,
      relocationAssistance,
      visaSponsorship,
      autoSkipVisaCandidates,
      remotePolicy,
      autoSkipRelocationCandidates,
      hiresIn,
      acceptWorldwide,
      remoteCulture,
      collaborationHours,
      salary,
      equity,
      currency,
      contactPersonName,
      contactPersonPosition,
      contactPersonLocation,
      contactPersonExperience,
      // subscribers,
      // coworkers,
      companySize,
      isDraft = false,
    } = req.body;

    // Validate required fields if not a draft
    if (!isDraft) {
      if (!title || !jobDescription || !jobType || !primaryRole) {
        return res.status(400).json({ error: 'Missing required fields to publish the job.' });
      }
      if (visaSponsorship === undefined || visaSponsorship === null) {
        return res.status(400).json({ error: 'visaSponsorship is required when publishing a job.' });
      }
    }
    console.log('User object in createJob:', user);

    const newJob = new Job({
      title,
      jobDescription,
      jobType,
      primaryRole,
      additionalRoles,
      workExperience,
      skills,
      location,
      timeZones,
      relocationRequired,
      relocationAssistance,
      visaSponsorship,
      autoSkipVisaCandidates,
      remotePolicy,
      autoSkipRelocationCandidates,
      hiresIn,
      acceptWorldwide,
      remoteCulture,
      collaborationHours,
      salary,
      equity,
      currency,
      contactPerson: {
        name: contactPersonName,
        position: contactPersonPosition,
        location: contactPersonLocation,
        experience: contactPersonExperience,
      },
      companySize,
      isDraft,
      organization: req.organization._id,
      companyName: req.organization.name, // ✅ Add this
      postedBy: user.id, // ✅ Ensure user exists and is populated
    });


    await newJob.save();

    const message = isDraft ? 'Job saved as draft' : 'Job created successfully';

    res.status(201).json({ message, job: newJob });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Server error while creating job' });
  }
};


// ✅ Create a new job
// exports.createJob = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!req.organization) {
//       return res.status(403).json({ error: 'Only organization users can post jobs.' });
//     }

//     const { visaType, ...otherFields } = req.body;

//     if (!visaType) {
//       return res.status(400).json({ error: 'visaType is required when posting a job.' });
//     }

//     const newJob = new Job({
//       ...otherFields,
//       visaType,
//       postedBy: user._id,
//       organization: req.organization._id,
//     });

//     await newJob.save();

//     res.status(201).json({ message: 'Job created successfully', job: newJob });
//   } catch (err) {
//     console.error('Error creating job:', err);
//     res.status(500).json({ error: 'Server error while creating job' });
//   }
// };

// ✅ Update an existing job
// exports.updateJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     const job = await Job.findOne({ _id: jobId, organization: req.organization._id });

//     if (!job) {
//       return res.status(404).json({ error: 'Job not found or unauthorized.' });
//     }

//     // Prevent changing visaType after creation
//     if (req.body.visaType && req.body.visaType !== job.visaType) {
//       return res.status(400).json({ error: 'Changing visaType is not allowed once the job is created.' });
//     }

//     Object.assign(job, req.body);
//     await job.save();

//     res.status(200).json({ message: 'Job updated successfully', job });
//   } catch (err) {
//     console.error('Error updating job:', err);
//     res.status(500).json({ error: 'Server error while updating job' });
//   }
// };
exports.updateJob = async (req, res) => {
  try {
    const user = req.user
    console.log(req.body)

    if (!req.organization) {
      return res.status(403).json({ error: 'Only organization users can edit jobs.' });
    }

    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, organization: req.organization._id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const {
      title,
      jobDescription,
      jobType,
      primaryRole,
      additionalRoles,
      workExperience,
      skills,
      timeZones,
      location,
      relocationRequired,
      relocationAssistance,
      visaSponsorship,
      autoSkipVisaCandidates,
      remotePolicy,
      autoSkipRelocationCandidates,
      hiresIn,
      acceptWorldwide,
      remoteCulture,
      collaborationHours,
      salary,
      equity,
      currency,
      contactPersonName,
      contactPersonPosition,
      contactPersonLocation,
      contactPersonExperience,
      companySize,
      isDraft,
    } = req.body;

    // Validate required fields if not a draft
    if (!isDraft) {
      if (!title || !jobDescription || !jobType || !primaryRole) {
        return res.status(400).json({ error: 'Missing required fields to publish the job.' });
      }
      // Optional: validate visaSponsorship if mandatory
      if (visaSponsorship === undefined || visaSponsorship === null) {
        return res.status(400).json({ error: 'visaSponsorship is required when publishing a job.' });
      }
    }

    // Update job fields
    job.title = title;
    job.jobDescription = jobDescription;
    job.jobType = jobType;
    job.primaryRole = primaryRole;
    job.additionalRoles = additionalRoles;
    job.workExperience = workExperience;
    job.skills = skills;
    job.location = location;
    job.timeZones = timeZones;
    job.relocationRequired = relocationRequired;
    job.relocationAssistance = relocationAssistance;
    job.visaSponsorship = visaSponsorship;
    job.autoSkipVisaCandidates = autoSkipVisaCandidates;
    job.remotePolicy = remotePolicy;
    job.autoSkipRelocationCandidates = autoSkipRelocationCandidates;
    job.hiresIn = hiresIn;
    job.acceptWorldwide = acceptWorldwide;
    job.remoteCulture = remoteCulture;
    job.collaborationHours = collaborationHours;
    job.salary = salary;
    job.equity = equity;
    job.currency = currency;
    job.contactPerson = {
      name: contactPersonName,
      position: contactPersonPosition,
      location: contactPersonLocation,
      experience: contactPersonExperience,
    };
    job.companySize = companySize;
    job.isDraft = isDraft;

    await job.save();

    const message = isDraft ? 'Job updated as draft' : 'Job updated successfully';

    res.status(200).json({ message, job });
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
exports.getActiveJobById = async (req, res) => {
  try {
    const jobId = new mongoose.Types.ObjectId(req.params.id);

    const job = await Job.findOne({
      _id: jobId,
      isDraft: false,
      active: true,
    }).populate('organization', 'name website industry');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not active',
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
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
// GET /api/jobs/org/all
exports.getAllJobsByOrganization = async (req, res) => {
  try {
    const jobs = await Job.find({
      organization: req.organization._id
    }).sort({ postedAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching published jobs by org:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDraftJobsByOrganization = async (req, res) => {
  try {
    const orgId = req.user.organization;

    const drafts = await Job.find({ organization: req.organization._id, isDraft: true }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: drafts.length,
      jobs: drafts,
    });
  } catch (error) {
    console.error('Error fetching draft jobs by org:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getJobByIdForPreview = async (req, res) => {
  try {
    const jobId = new mongoose.Types.ObjectId(req.params.id);

    const job = await Job.findOne({ _id: jobId })
      .populate('organization', 'name website industry');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Optional: Check if the current user owns this job or is an admin
    // if (job.organization.toString() !== req.user.organizationId && !req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Unauthorized" });
    // }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Error fetching job preview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
exports.getProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;  // Extracted from JWT by auth middleware

    const profileImage = await ProfileImage.findOne({ userId });

    if (!profileImage) {
      return res.status(404).json({ error: "Profile image not found" });
    }

    res.status(200).json(profileImage);
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ error: "Server error" });
  }
};
