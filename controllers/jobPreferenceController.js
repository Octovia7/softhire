const asyncHandler = require('express-async-handler');
const JobPreferences = require('../models/JobPreferences');

const saveJobPreferences = asyncHandler(async (req, res) => {
  const { 
    needsSponsorship,
    authorizedToWork,
    jobType,
    openTo,
    workLocation,
    openToRemote,
    remotePreference,
    desiredSalary,
    companySizePreferences 
  } = req.body;

  const userId = req.user.id;

  const existing = await JobPreferences.findOne({ userId });

  if (existing) {
    // update
    existing.set({
      needsSponsorship,
      authorizedToWork,
      jobType,
      openTo,
      workLocation,
      openToRemote,
      remotePreference,
      desiredSalary,
      companySizePreferences
    });
    await existing.save();
    return res.status(200).json({ message: 'Job preferences updated' });
  }

  const preferences = new JobPreferences({
    userId,
    needsSponsorship,
    authorizedToWork,
    jobType,
    openTo,
    workLocation,
    openToRemote,
    remotePreference,
    desiredSalary,
    companySizePreferences
  });

  await preferences.save();
  res.status(201).json({ message: 'Job preferences saved' });
});

module.exports = { saveJobPreferences };
