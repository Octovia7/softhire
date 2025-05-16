const Document = require('../models/Document');
const cloudinary = require('../utils/cloudinary'); // only needed if you want to delete from Cloudinary

const ALLOWED_TYPES = ['Passport', 'eVisa', 'Proof of English', 'Police Check', 'TB Certificate'];

// Upload or update document in profile
exports.uploadOrUpdateProfileDocument = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { type } = req.body;

    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    const fileUrl = req.file.path;

    let existing = await Document.findOne({ candidate: candidateId, type });

    // Optional: Delete old Cloudinary file
    // if (existing && existing.fileUrl) {
    //   const publicId = getPublicIdFromUrl(existing.fileUrl);
    //   await cloudinary.uploader.destroy(publicId);
    // }

    let document;
    if (existing) {
      existing.fileUrl = fileUrl;
      existing.uploadedAt = new Date();
      document = await existing.save();
    } else {
      document = await Document.create({
        candidate: candidateId,
        type,
        fileUrl,
      });
    }

    res.status(200).json({ message: 'Document saved', document });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: 'Server error while uploading document' });
  }
};

// Get all profile documents for logged-in candidate
exports.getCandidateProfileDocuments = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const documents = await Document.find({ candidate: candidateId });
    res.status(200).json({ documents });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete document from profile
exports.deleteProfileDocument = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { docId } = req.params;

    const document = await Document.findOne({ _id: docId, candidate: candidateId });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    // Optional: Remove from Cloudinary
    // const publicId = getPublicIdFromUrl(document.fileUrl);
    // await cloudinary.uploader.destroy(publicId);

    await document.remove();
    res.status(200).json({ message: 'Document deleted' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Org: view documents for a given candidate profile
exports.getDocumentsForCandidateProfile = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const documents = await Document.find({ candidate: candidateId });
    res.status(200).json({ documents });
  } catch (err) {
    console.error('Error fetching candidate documents for org:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Optional helper for Cloudinary file deletion
function getPublicIdFromUrl(url) {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  const [publicId] = fileName.split('.');
  return parts.slice(-2, -1)[0] + '/' + publicId; // folder + name
}
