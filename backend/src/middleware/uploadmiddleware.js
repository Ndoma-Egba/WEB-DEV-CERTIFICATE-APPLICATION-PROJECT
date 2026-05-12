const fs = require('fs');
const path = require('path');
const multer = require('multer');

const documentsDir = path.join(__dirname, '..', '..', 'uploads', 'documents');

fs.mkdirSync(documentsDir, { recursive: true });

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png'
]);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, documentsDir);
  },
  filename: function(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const uploadDocuments = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  },
  fileFilter: function(req, file, cb) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Only PDF, JPG, and PNG documents are allowed'));
    }

    cb(null, true);
  }
});

module.exports = {
  documentsDir,
  uploadDocuments
};
