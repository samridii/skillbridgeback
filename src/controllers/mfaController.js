const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/User');

// generate a secret and QR code, user scans it but MFA isnt enabled yet until verified
const setupMfa = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.universityEmail, 'SkillBridge', secret);

    user.mfaSecret = secret; // stored but mfaEnabled stays false until confirmed
    await user.save();

    const qrImage = await qrcode.toDataURL(otpauthUrl); // base64 image, frontend renders it directly

    res.status(200).json({ qrImage });
  } catch (err) {
    res.status(500).json({ error: 'MFA setup failed' });
  }
};

// user submits the 6 digit code from their app to confirm setup
const verifyMfaSetup = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.session.userId).select('+mfaSecret');
    if (!user || !user.mfaSecret) return res.status(400).json({ error: 'MFA not initiated' });

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!isValid) return res.status(401).json({ error: 'Invalid code' });

    user.mfaEnabled = true; // only now does MFA actually become required at login
    await user.save();

    res.status(200).json({ message: 'MFA enabled' });
  } catch (err) {
    res.status(500).json({ error: 'MFA verification failed' });
  }
};

// used during login when mfaRequired was true
const verifyMfaLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.session.userId).select('+mfaSecret');
    if (!user || !user.mfaEnabled) return res.status(400).json({ error: 'MFA not enabled' });

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!isValid) return res.status(401).json({ error: 'Invalid code' });

    req.session.mfaPassed = true; // flag checked by middleware on protected routes
    res.status(200).json({ message: 'MFA verified' });
  } catch (err) {
    res.status(500).json({ error: 'MFA verification failed' });
  }
};

module.exports = { setupMfa, verifyMfaSetup, verifyMfaLogin };