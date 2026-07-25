const rateLimit = require('express-rate-limit');

// strict limit for login and register specifically
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// looser general limit for all other api routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // generous, this is anti abuse not anti normal usage
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };