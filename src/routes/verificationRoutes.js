const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, requireRole } = require('../middleware/auth');
const {
  uploadVerificationDoc,
  getPendingVerifications,
  viewVerificationDoc,
  approveVerification,
  rejectVerification,
} = require('../controllers/verificationController');

// student self service
router.post('/upload', protect, upload.single('idDocument'), uploadVerificationDoc);

// admin only
router.get('/pending', protect, requireRole('admin'), getPendingVerifications);
router.get('/:userId/document', protect, requireRole('admin'), viewVerificationDoc);
router.post('/:userId/approve', protect, requireRole('admin'), approveVerification);
router.post('/:userId/reject', protect, requireRole('admin'), rejectVerification);

module.exports = router;