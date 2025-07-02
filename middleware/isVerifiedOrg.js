const mongoose = require('mongoose');
const Organization = require('../models/Organization');

const isVerifiedOrg = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const organization = await Organization.findOne({ createdBy: userId });

    console.log('🏢 Organization found:', organization);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found for this user.' });
    }

    // 👇 Removed verification check
    req.organization = organization; // Make it available downstream
    next();
  } catch (err) {
    console.error('Middleware error:', err);
    res.status(500).json({ error: 'Server error in organization middleware.' });
  }
};

module.exports = isVerifiedOrg;
