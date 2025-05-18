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


exports.createJob = async (req, res) => {
  try {
    const user = req.user;

    if (!req.organization) {
      return res.status(403).json({ error: 'Only organization users can post jobs.' });
    }

    const {
      title,
      jobDescription,
      jobType,
      primaryRole,
      additionalRoles,
      workExperience,
      skills,
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
      salary = {},
      equity = {},
      currency,
      contactPerson = {},
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

    const newJob = new Job({
      title,
      jobDescription,
      jobType,
      primaryRole,
      additionalRoles,
      workExperience,
      skills,
      location: Array.isArray(location) ? location : location ? [location] : [],
      relocationRequired,
      relocationAssistance,
      visaSponsorship,
      autoSkipVisaCandidates,
      remotePolicy,
      autoSkipRelocationCandidates,
      hiresIn,
      acceptWorldwide,
      remoteCulture,
      collaborationHours: {
        start: collaborationHours?.start,
        end: collaborationHours?.end,
        timeZone: collaborationHours?.timeZone,
      },
      salary,
      equity,
      currency: currency || 'GBP',
      contactPerson: {
        name: contactPerson.name,
        position: contactPerson.position,
        location: contactPerson.location,
        experience: contactPerson.experience,
      },
      companySize,
      isDraft,
      organization: req.organization._id,
      companyName: req.organization.name,
      postedBy: user.id,
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
    const user = req.user;

    if (!req.organization) {
      return res.status(403).json({ error: 'Only organization users can edit jobs.' });
    }

    const { jobId } = req.params;
    console.log('jobId param:', jobId);
    console.log('organization:', req.organization?._id);

    const job = await Job.findOne({ _id: jobId, organization: req.organization._id });
    console.log('Found job:', job);

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Ensure the job belongs to the current organization
    if (!job.organization.equals(req.organization._id)) {
      return res.status(403).json({ error: 'Unauthorized to edit this job.' });
    }

    const {
      title,
      jobDescription,
      jobType,
      primaryRole,
      additionalRoles,
      workExperience,
      skills,
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
      collaborationHoursStart,
      collaborationHoursEnd,
      collaborationTimeZone,
      salaryMin,
      salaryMax,
      equityMin,
      equityMax,
      currency,
      contactPersonName,
      contactPersonPosition,
      contactPersonLocation,
      contactPersonExperience,
      companySize,
      isDraft,
    } = req.body;

    // Prepare final values for validation (use req.body values if present, else existing job values)
    const finalTitle = title !== undefined ? title : job.title;
    const finalJobDescription = jobDescription !== undefined ? jobDescription : job.jobDescription;
    const finalJobType = jobType !== undefined ? jobType : job.jobType;
    const finalPrimaryRole = primaryRole !== undefined ? primaryRole : job.primaryRole;
    const finalVisaSponsorship = visaSponsorship !== undefined ? visaSponsorship : job.visaSponsorship;
    const finalIsDraft = isDraft !== undefined ? isDraft : job.isDraft;

    // If trying to publish (not draft), validate required fields
    if (!finalIsDraft) {
      if (
        !finalTitle || finalTitle.trim() === '' ||
        !finalJobDescription || finalJobDescription.trim() === '' ||
        !finalJobType || finalJobType.trim() === '' ||
        !finalPrimaryRole || finalPrimaryRole.trim() === ''
      ) {
        console.log('Validation failed for required fields:', {
          title: finalTitle,
          jobDescription: finalJobDescription,
          jobType: finalJobType,
          primaryRole: finalPrimaryRole,
        });
        return res.status(400).json({ error: 'Missing or empty required fields to publish the job.' });
      }
      if (finalVisaSponsorship === undefined || finalVisaSponsorship === null) {
        console.log('Validation failed: visaSponsorship missing or null');
        return res.status(400).json({ error: 'visaSponsorship is required when publishing a job.' });
      }
    }

    // Update fields if present
    if (title !== undefined) job.title = title;
    if (jobDescription !== undefined) job.jobDescription = jobDescription;
    if (jobType !== undefined) job.jobType = jobType;
    if (primaryRole !== undefined) job.primaryRole = primaryRole;
    if (additionalRoles !== undefined) job.additionalRoles = additionalRoles;
    if (workExperience !== undefined) job.workExperience = workExperience;
    if (skills !== undefined) job.skills = skills;
    if (location !== undefined) job.location = Array.isArray(location) ? location : [location];
    if (relocationRequired !== undefined) job.relocationRequired = relocationRequired;
    if (relocationAssistance !== undefined) job.relocationAssistance = relocationAssistance;
    if (visaSponsorship !== undefined) job.visaSponsorship = visaSponsorship;
    if (autoSkipVisaCandidates !== undefined) job.autoSkipVisaCandidates = autoSkipVisaCandidates;
    if (remotePolicy !== undefined) job.remotePolicy = remotePolicy;
    if (autoSkipRelocationCandidates !== undefined) job.autoSkipRelocationCandidates = autoSkipRelocationCandidates;
    if (hiresIn !== undefined) job.hiresIn = Array.isArray(hiresIn) ? hiresIn : [hiresIn];
    if (acceptWorldwide !== undefined) job.acceptWorldwide = acceptWorldwide;
    if (remoteCulture !== undefined) job.remoteCulture = remoteCulture;

    // Collaboration hours update
    if (
      collaborationHoursStart !== undefined ||
      collaborationHoursEnd !== undefined ||
      collaborationTimeZone !== undefined
    ) {
      job.collaborationHours = {
        start:
          collaborationHoursStart !== undefined
            ? collaborationHoursStart
            : job.collaborationHours?.start,
        end:
          collaborationHoursEnd !== undefined ? collaborationHoursEnd : job.collaborationHours?.end,
        timeZone:
          collaborationTimeZone !== undefined
            ? collaborationTimeZone
            : job.collaborationHours?.timeZone,
      };
    }

    // Salary update
    if (salaryMin !== undefined || salaryMax !== undefined) {
      job.salary = {
        min: salaryMin !== undefined ? salaryMin : job.salary?.min,
        max: salaryMax !== undefined ? salaryMax : job.salary?.max,
      };
    }

    // Equity update
    if (equityMin !== undefined || equityMax !== undefined) {
      job.equity = {
        min: equityMin !== undefined ? equityMin : job.equity?.min,
        max: equityMax !== undefined ? equityMax : job.equity?.max,
      };
    }

    if (currency !== undefined) job.currency = currency;

    // Contact person update
    if (
      contactPersonName !== undefined ||
      contactPersonPosition !== undefined ||
      contactPersonLocation !== undefined ||
      contactPersonExperience !== undefined
    ) {
      job.contactPerson = {
        name:
          contactPersonName !== undefined
            ? contactPersonName
            : job.contactPerson?.name,
        position:
          contactPersonPosition !== undefined
            ? contactPersonPosition
            : job.contactPerson?.position,
        location:
          contactPersonLocation !== undefined
            ? contactPersonLocation
            : job.contactPerson?.location,
        experience:
          contactPersonExperience !== undefined
            ? contactPersonExperience
            : job.contactPerson?.experience,
      };
    }

    if (companySize !== undefined) job.companySize = companySize;

    // Draft or published flag update
    if (isDraft !== undefined) job.isDraft = isDraft;

    await job.save();

    const message = job.isDraft ? 'Job updated as draft' : 'Job updated successfully';

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
    const orgId = req.user.organization;

    const jobs = await Job.find({
     organization: req.organization._id,
      isDraft: false,
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