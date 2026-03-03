const Job = require('../models/Job');
const mongoose = require('mongoose');
const Recruiter = require('../models/Recruiter');
const asyncHandler = require("express-async-handler");
const Application = require('../models/Application');
const Profile = require("../models/Profile");
exports.getOrgStats = asyncHandler(async (req, res) => {
  const orgId = req.organization._id;

  // 1. Get all jobs and filter by active status
  const jobs = await Job.find({ organization: orgId }).select("_id primaryRole isHiring isDraft active").lean();
  const jobIds = jobs.map(job => job._id);

  // ✅ Count active jobs correctly
  const activeJobsCount = jobs.filter(job => job.isHiring && !job.isDraft && job.active).length;

  // 2. Count total applicants for those jobs
  const totalApplicants = await Application.countDocuments({
    job: { $in: jobIds }
  });

  // 3. Get applications and associated candidate userIds
  const applications = await Application.find({ job: { $in: jobIds } })
    .select("candidate job")
    .populate("job", "primaryRole")
    .lean();

  const candidateUserIds = applications.map(app => app.candidate);

  // 4. Get profiles for those candidates
  const profiles = await Profile.find({ userId: { $in: candidateUserIds } })
    .select("userId primaryRole")
    .lean();

  const profileMap = new Map();
  profiles.forEach(profile => {
    profileMap.set(profile.userId.toString(), profile.primaryRole?.toLowerCase());
  });

  // 5. Count matches
  let matchCount = 0;
  for (const app of applications) {
    const userId = app.candidate?.toString();
    const jobRole = app.job?.primaryRole?.toLowerCase();
    const profileRole = profileMap.get(userId);

    if (jobRole && profileRole && jobRole === profileRole) {
      matchCount++;
    }
  }

  // ✅ Return all stats
  res.status(200).json({
    applicants: totalApplicants,
    matches: matchCount,
    activeJobs: activeJobsCount,
  });
});




exports.getActivityFeedForOrg = asyncHandler(async (req, res) => {
  const orgId = req.organization._id;

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return res.status(400).json({ error: "Invalid organization ID." });
  }

  // Fetch jobs posted by org, limit to last 60 days
  const jobs = await Job.find({
    organization: orgId,
    postedAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } // 60 days
  })
    .select("_id title postedAt")
    .sort({ postedAt: -1 })
    .limit(10)
    .lean();

  const jobIds = jobs.map(job => job._id);

  const applications = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    {
      $group: {
        _id: "$job",
        count: { $sum: 1 },
        latest: { $max: "$createdAt" }
      }
    },
    { $sort: { latest: -1 } },
    { $limit: 10 }
  ]);

  // Build a map of jobId → jobTitle for quick lookup
  const jobMap = {};
  jobs.forEach(job => {
    jobMap[job._id.toString()] = job.title;
  });

  const activity = [];

  // 🟢 Job posts
  jobs.forEach(job => {
    activity.push({
      type: "job_posted",
      message: `You posted a job for ${job.title}.`,
      timestamp: job.postedAt
    });
  });

  // 🔵 Applications
  applications.forEach(app => {
    const jobTitle = jobMap[app._id.toString()];
    if (jobTitle) {
      activity.push({
        type: "candidates_matched",
        message: `${app.count} candidate(s) matched for ${jobTitle} role.`,
        timestamp: app.latest
      });
    }
  });

  // Final sort
  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.status(200).json({ activity });
});
exports.updateRecruiter = async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  const recruiter = await Recruiter.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }

  res.status(200).json({
    message: "Recruiter profile updated successfully",
    recruiter,
  });
};
exports.getRecruiter = async (req, res) => {
  const userId = req.user.id; // assuming middleware attaches `user` to `req`

  const recruiter = await Recruiter.findOne({ userId })
    .populate("organization", "name") // optional
    .lean();

  if (!recruiter) {
    return res.status(404).json({ message: "Recruiter not found" });
  }

  res.status(200).json(recruiter);
};

exports.getApplicationsForOrg = async (req, res) => {
  try {
    const orgId = req.organization._id;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID." });
    }

    const jobs = await Job.find({ organization: orgId }, "_id");
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'candidate',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'candidates',
          localField: 'candidate',
          foreignField: 'userId',
          as: 'candidateData'
        }
      },
      { $unwind: { path: '$candidateData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          coverLetter: 1,
          status: 1,
          statusUpdatedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentStatus: 1,
          cosRefNumber: 1,
          cosSubmittedAt: 1,
          oneTimePlan: 1,
          stripeSessionId: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email'
          },
          resume: '$candidateData.resume',
          job: {
            _id: '$job._id',
            title: '$job.title',
            visaType: '$job.visaType'
          }
        }
      }
    ]);

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
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.getApplicationsByJobAndStatus = async (req, res) => {
  const { jobId } = req.params;
  const { status } = req.query;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid jobId format.' });
  }

  try {
    const matchStage = { job: new mongoose.Types.ObjectId(jobId) };
    if (status) matchStage.status = status;

    const applications = await Application.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'profiles',
          localField: 'candidate',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'candidate',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      // Always get the latest profile image for this candidate (by userId)
      {
        $lookup: {
          from: 'profileimages',
          let: { userId: '$candidate' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'profileImageDoc'
        }
      },
      { $unwind: { path: '$profileImageDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          candidateId: '$candidate',
          userId: '$candidate', // <-- Added userId in response
          name: '$profile.name',
          email: '$user.email',
          primaryRole: '$profile.primaryRole',
          appliedOn: '$createdAt',
          status: 1,
          statusUpdatedAt: 1,
          location: '$profile.location',
          yearsOfExperience: '$profile.yearsOfExperience',
          skills: '$profile.skills',
          // Apply Cloudinary transformation to profile image
          profileImage: {
            $cond: [
              { $ifNull: ['$profileImageDoc.imageUrl', false] },
              {
                $concat: [
                  { $arrayElemAt: [{ $split: ['$profileImageDoc.imageUrl', '/upload/'] }, 0] },
                  '/upload/q_auto:eco,f_auto,w_200/',
                  { $arrayElemAt: [{ $split: ['$profileImageDoc.imageUrl', '/upload/'] }, 1] }
                ]
              },
              null
            ]
          }
        }
      },
      { $sort: { appliedOn: -1 } }
    ]);

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
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

    // Check if the jobId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid jobId format.' });
    }

    // Find and delete the job
    const job = await Job.findOneAndDelete({ _id: jobId, organization: req.organization._id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized.' });
    }

    res.status(200).json({ message: 'Job deleted successfully', job });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Server error while deleting job' });
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
