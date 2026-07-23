const User = require('../models/User');

// confirms a valid session exists and mfa is fully passed if enabled
const protect = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.session.mfaPassed) {
    return res.status(401).json({ error: 'MFA verification required' });
  }

  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' }); // account may have been deleted
  }

  req.user = user; // attach fresh user doc, not just session data, so role changes take effect immediately
  next();
};

// restricts a route to specific roles, used after protect
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

module.exports = { protect, requireRole };