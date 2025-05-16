const CertificateOfSponsorship = require('../models/Cos');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Document = require('../models/Document');

const COS_VALIDITY_MONTHS = parseInt(process.env.COS_VALIDITY_MONTHS) || 6;

// Utility: Check if required documents exist
const hasRequiredDocuments = async (candidateId) => {
  const requiredTypes = ['Passport', 'Police Check'];
  const documents = await Document.find({
    candidate: candidateId,
    type: { $in: requiredTypes },
  });

  const uploadedTypes = documents.map((doc) => doc.type);
  for (const type of requiredTypes) {
    if (!uploadedTypes.includes(type)) {
      return { valid: false, missing: type };
    }
  }
  return { valid: true };
};

// POST /cos/apply
exports.applyForCOS = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { jobId, visaType } = req.body;

    if (!visaType) {
      return res.status(400).json({ error: 'Visa type is required' });
    }

    // 1. Validate job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // 2. Check application is hired
    const application = await Application.findOne({ job: jobId, candidate: candidateId });
    if (!application || application.status !== 'Hired') {
      return res.status(400).json({ error: 'You must be hired for this job to request a CoS' });
    }

    // 3. Required document check
    const docCheck = await hasRequiredDocuments(candidateId);
    if (!docCheck.valid) {
      return res.status(400).json({ error: `Missing required document: ${docCheck.missing}` });
    }

    // 4. Prevent duplicate CoS
    const existingCOS = await CertificateOfSponsorship.findOne({
      candidate: candidateId,
      job: jobId,
      status: { $in: ['pending', 'issued'] },
    });
    if (existingCOS) {
      return res.status(409).json({ error: 'A CoS has already been requested or issued for this job' });
    }

    // 5. Create pending CoS (no referenceNumber yet)
    const expiryDate = new Date(Date.now() + COS_VALIDITY_MONTHS * 30 * 24 * 60 * 60 * 1000);

    const newCOS = await CertificateOfSponsorship.create({
      candidate: candidateId,
      organization: job.organization,
      job: job._id,
      visaType,
      expiryDate,
      status: 'pending',
    });

    res.status(201).json({ message: 'CoS application submitted successfully', cos: newCOS });
  } catch (err) {
    console.error('Error applying for CoS:', err);
    res.status(500).json({ error: 'Server error while applying for CoS' });
  }
};

// GET /cos/applications
exports.getCOSApplications = async (req, res) => {
  try {
    const orgId = req.organization._id;

    const cosApplications = await CertificateOfSponsorship.find({ organization: orgId })
      .populate('candidate', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ cosApplications });
  } catch (err) {
    console.error('Error fetching CoS applications:', err);
    res.status(500).json({ error: 'Server error while fetching CoS applications' });
  }
};

// PUT /cos/:cosId/approve
// PUT /cos/:cosId/approve
exports.approveCOS = async (req, res) => {
  try {
    const { cosId } = req.params;
    const { referenceNumber } = req.body;

    if (!req.organization || !req.organization._id) {
      return res.status(403).json({ error: 'Organization context not available' });
    }

    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: 'User context not available' });
    }

    if (!referenceNumber) {
      return res.status(400).json({ error: 'Official reference number from Home Office is required.' });
    }

    const cos = await CertificateOfSponsorship.findOne({
      _id: cosId,
      organization: req.organization._id,
    });

    if (!cos) {
      return res.status(404).json({ error: 'CoS not found' });
    }

    if (cos.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending CoS can be approved' });
    }

    cos.status = 'issued';
    cos.referenceNumber = referenceNumber;
    cos.issuedBy = req.user.id; // <-- changed from req.user._id
    cos.issueDate = new Date();
    cos.expiryDate = new Date(Date.now() + COS_VALIDITY_MONTHS * 30 * 24 * 60 * 60 * 1000);

    await cos.save();

    res.status(200).json({ message: 'CoS issued successfully', cos });
  } catch (err) {
    console.error('Error issuing CoS:', err.message, err.stack);
    res.status(500).json({ error: 'Server error while issuing CoS' });
  }
};


// PUT /cos/:cosId/revoke
exports.revokeCOS = async (req, res) => {
  try {
    const { cosId } = req.params;

    const cos = await CertificateOfSponsorship.findOne({
      _id: cosId,
      organization: req.organization._id,
    });

    if (!cos) {
      return res.status(404).json({ error: 'CoS not found' });
    }

    if (cos.status === 'revoked') {
      return res.status(400).json({ error: 'CoS is already revoked' });
    }

    cos.status = 'revoked';
    await cos.save();

    res.status(200).json({ message: 'CoS revoked successfully', cos });
  } catch (err) {
    console.error('Error revoking CoS:', err);
    res.status(500).json({ error: 'Server error while revoking CoS' });
  }
};
