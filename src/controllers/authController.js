const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');

const MAX_ATTEMPTS = 5; // lockout threshold
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// register a new user, always starts as unverified
const register = async (req, res) => {
  try {
    const { universityEmail, password, fullName } = req.body;

    const existing = await User.findOne({ universityEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const user = await User.create({
      universityEmail,
      passwordHash: password, // gets hashed by the pre-save hook in the model
      fullName,
    });

    logSecurityEvent('user_registered', { userId: user._id, email: universityEmail });

    res.status(201).json({
      message: 'Account created, pending verification',
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' }); // no internal detail leaked to client
  }
};

// login with lockout and generic error messages
const login = async (req, res) => {
  try {
    const { universityEmail, password } = req.body;

    const user = await User.findOne({ universityEmail }).select('+passwordHash');

    // same generic message whether email exists or not, avoids user enumeration
    if (!user) {
      logSecurityEvent('login_failed', { reason: 'unknown_email', emailAttempted: universityEmail });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isLocked) {
      return res.status(423).json({ error: 'Account temporarily locked, try again later' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME; // lock account after too many failures
      }
      await user.save();
      logSecurityEvent('login_failed', { reason: 'wrong_password', userId: user._id });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // successful login resets failure tracking
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // regenerate session on login to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });

      req.session.userId = user._id;
      req.session.role = user.role;
      req.session.mfaPassed = !user.mfaEnabled; // true immediately if MFA is off, false if it still needs verifying

      logSecurityEvent('login_success', { userId: user._id });

      res.status(200).json({
        message: 'Login successful',
        role: user.role,
        mfaRequired: user.mfaEnabled, // frontend prompts for MFA code next if true
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' }); // fixed, was wrongly saying Registration failed
  }
};

// logout destroys the server-side session
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid'); // remove cookie from browser too
    res.status(200).json({ message: 'Logged out' });
  });
};

module.exports = { register, login, logout };