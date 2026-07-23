const rateLimit = require('express-rate-limit');

// stricter limit for login/register, general endpoints get looser limits elsewhere
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 10, // 10 attempts per IP per window
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };