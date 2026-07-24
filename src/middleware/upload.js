const multer = require('multer');
const path = require('path');

// store in memory first, we encrypt and write to disk ourselves in the controller
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // whitelist not blacklist
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, or PDF files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb cap prevents disk exhaustion attacks
});

module.exports = upload;