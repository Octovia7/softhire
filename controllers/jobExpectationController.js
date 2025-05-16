const asyncHandler = require('express-async-handler');
const JobExpectations = require('../models/JobExpectations');

const saveJobExpectations = asyncHandler(async (req, res) => {
  const {
    jobDescription,
    workEnvironment,
    importantFactors,
    flexibleRemoteImportance,
    quietOfficeImportance,
    interestedMarkets,
    notInterestedMarkets
  } = req.body;

  const userId = req.user.id;

  if (importantFactors.length > 2) {
    return res.status(400).json({ message: 'Select a maximum of 2 important factors.' });
  }

  const existing = await JobExpectations.findOne({ userId });

  if (existing) {
    existing.set({
      jobDescription,
      workEnvironment,
      importantFactors,
      flexibleRemoteImportance,
      quietOfficeImportance,
      interestedMarkets,
      notInterestedMarkets
    });
    await existing.save();
    return res.status(200).json({ message: 'Job expectations updated' });
  }

  const jobExpectations = new JobExpectations({
    userId,
    jobDescription,
    workEnvironment,
    importantFactors,
    flexibleRemoteImportance,
    quietOfficeImportance,
    interestedMarkets,
    notInterestedMarkets
  });

  await jobExpectations.save();
  res.status(201).json({ message: 'Job expectations saved' });
});

module.exports = { saveJobExpectations };
