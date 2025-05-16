const Organization = require('../models/Organization');

const getPendingOrganizations = async (req, res) => {
try {
const pendingOrgs = await Organization.find({ status: 'pending' });
res.json(pendingOrgs);
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

const approveOrganization = async (req, res) => {
try {
const org = await Organization.findByIdAndUpdate(
req.params.id,
{ status: 'verified' },
{ new: true }
);
if (!org) return res.status(404).json({ message: 'Organization not found' });
res.json({ message: 'Organization approved', org });
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

const rejectOrganization = async (req, res) => {
try {
const org = await Organization.findByIdAndUpdate(
req.params.id,
{ status: 'rejected' },
{ new: true }
);
if (!org) return res.status(404).json({ message: 'Organization not found' });
res.json({ message: 'Organization rejected', org });
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

const getOrganizationsByStatus = async (req, res) => {
try {
const { status } = req.query;
const orgs = await Organization.find({ status });
res.json(orgs);
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};  
module.exports = {getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    getOrganizationsByStatus};