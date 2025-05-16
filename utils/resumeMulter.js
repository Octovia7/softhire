// utils/resumeMulter.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // your Cloudinary instance

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Resumes', // Store resumes in the 'Resumes' folder
    resource_type: 'raw', // Resumes are raw files, not images
    allowed_formats: ['pdf', 'doc', 'docx', 'txt'], // allowed formats
  },
});

const uploadResume = multer({ storage: resumeStorage });

module.exports = uploadResume; // Ensure this is exporting the multer instance with .single() method
