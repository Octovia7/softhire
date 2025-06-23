const path = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary"); // correct relative path

const passportStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname);
    const filename = path.basename(file.originalname, ext);

    return {
      folder: "passports", // 💾 Stored in Cloudinary's 'passports' folder
      resource_type: "auto", // 📦 Handles pdf/image
      public_id: `${filename}_${Date.now()}${ext}`, // 🆔 Unique filename
      allowed_formats: ["pdf"], // ✅ Only allow PDF
    };
  },
});

const uploadPassport = multer({ storage: passportStorage });

module.exports = uploadPassport;
