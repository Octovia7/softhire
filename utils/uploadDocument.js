const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname);
    const filename = path.basename(file.originalname, ext);

    return {
      folder: 'SupportingDocuments', // folder in Cloudinary
      resource_type: 'auto',
      public_id: `${filename}_${Date.now()}${ext}`,
      allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
    };
  },
});

const upload = multer({ storage: documentStorage });

module.exports = upload;
