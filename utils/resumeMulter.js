const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname); 
    const filename = path.basename(file.originalname, ext);

    return {
      folder: 'Resumes',
      resource_type: 'auto', // ✅ automatically sets correct type (image, video, raw)
      public_id: `${filename}_${Date.now()}${ext}`,
      allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
    };
  },
});


const uploadResume = multer({ storage: resumeStorage });

module.exports = uploadResume;
