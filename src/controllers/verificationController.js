const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { encryptBuffer, decryptBuffer } = require('../utils/encryption');
const { logSecurityEvent } = require('../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'secure_uploads'); // outside the webroot, never served statically

// ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// student uploads their id document
const uploadVerificationDoc = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const encrypted = encryptBuffer(req.file.buffer);
    const filename = `${req.user._id}_${Date.now()}.enc`; // random-ish name, not the original filename
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), encrypted);

    const user = await User.findById(req.user._id);
    user.studentIdDocPath = filename;
    user.verificationStatus = 'pending';
    await user.save();

    res.status(200).json({ message: 'Document uploaded, pending review' });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

// admin views the queue of pending verifications
const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: 'pending' }).select('fullName universityEmail createdAt');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
};

// admin views the decrypted document for a specific pending user
const viewVerificationDoc = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('+studentIdDocPath');
    if (!user || !user.studentIdDocPath) return res.status(404).json({ error: 'Document not found' });

    const encrypted = fs.readFileSync(path.join(UPLOAD_DIR, user.studentIdDocPath));
    const decrypted = decryptBuffer(encrypted);

    res.set('Content-Type', 'application/octet-stream');
    res.send(decrypted); // decrypted only in memory for this response, never written back to disk
  } catch (err) {
    res.status(500).json({ error: 'Failed to load document' });
  }
};

// admin approves, flips role to verified
const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.verificationStatus = 'verified';
    user.role = 'verified'; // this is the actual privilege change
    await user.save();

    logSecurityEvent('verification_approved', { userId: user._id, approvedBy: req.user._id });

    res.status(200).json({ message: 'User verified' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
};

// admin rejects
const rejectVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.verificationStatus = 'rejected';
    await user.save();

    logSecurityEvent('verification_rejected', { userId: user._id, rejectedBy: req.user._id });

    res.status(200).json({ message: 'User rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed' });
  }
};

module.exports = {
  uploadVerificationDoc,
  getPendingVerifications,
  viewVerificationDoc,
  approveVerification,
  rejectVerification,
};