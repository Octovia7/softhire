// controllers/jobController.js

const Job = require('../models/Job');
// controllers/jobController.js
// const Job = require('../models/Job');
const Profile = require('../models/Profile');

const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId }); // ✅ fixed field name
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const { skills = [], openToRoles = [], location } = profile;

    const filters = {
      active: true,
      $or: [
        { skills: { $in: skills } },
        { title: { $in: openToRoles } },
        { jobType: { $in: openToRoles } },
        { location: { $in: [location] } },
      ],
    };

    const recommendedJobs = await Job.find(filters).sort({ postedAt: -1 });

    res.json({ recommendedJobs });
  } catch (err) {
    console.error('Recommended jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




const browseJobs = async (req, res) => {
    try {
        const { remote, jobType, location, page = 1, limit = 10 } = req.query;
        const filters = { active: true };

        if (remote) {
            filters.remotePolicy = new RegExp(remote, 'i'); // e.g. 'Fully Remote', 'Hybrid', etc.
        }

        if (jobType) {
            filters.jobType = jobType; // Make sure 'jobType' exists in your schema
        }

        if (location) {
            filters.location = { $regex: location, $options: 'i' };
        }

        const jobs = await Job.find(filters)
            .sort({ postedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(filters);

        res.json({
            jobs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error('Browse jobs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ active: true }).sort({ postedAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error('Get all jobs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    browseJobs,
    getAllJobs,
    getRecommendedJobs
};
// module.exports = { browseJobs };
