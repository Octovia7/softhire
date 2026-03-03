const asyncHandler = require('express-async-handler');
const JobPreferences = require('../models/JobPreferences');

// Save or update job preferences
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
    salaryCurrency,
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
      salaryCurrency,
      companySizePreferences
    });
    await existing.save();
    return res.status(200).json({ 
      message: 'Job preferences updated successfully',
      data: existing 
    });
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
    salaryCurrency,
    companySizePreferences
  });

  await preferences.save();
  res.status(201).json({ 
    message: 'Job preferences saved successfully',
    data: preferences 
  });
});

// Get job preferences for current user
const getJobPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const preferences = await JobPreferences.findOne({ userId });

  if (!preferences) {
    return res.status(404).json({ 
      message: 'No job preferences found',
      data: null 
    });
  }

  res.status(200).json({
    message: 'Job preferences retrieved successfully',
    data: preferences
  });
});

// Update job preferences
const updateJobPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  const preferences = await JobPreferences.findOneAndUpdate(
    { userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!preferences) {
    return res.status(404).json({ 
      message: 'Job preferences not found' 
    });
  }

  res.status(200).json({
    message: 'Job preferences updated successfully',
    data: preferences
  });
});

// Delete job preferences
const deleteJobPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const preferences = await JobPreferences.findOneAndDelete({ userId });

  if (!preferences) {
    return res.status(404).json({ 
      message: 'Job preferences not found' 
    });
  }

  res.status(200).json({
    message: 'Job preferences deleted successfully'
  });
});

module.exports = { 
  saveJobPreferences,
  getJobPreferences,
  updateJobPreferences,
  deleteJobPreferences
};
