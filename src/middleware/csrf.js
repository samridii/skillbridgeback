const { doubleCsrf } = require('csrf-csrf');

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET, // reuse existing secret, one less thing to manage
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'], // frontend must send this header
});

module.exports = { generateToken, doubleCsrfProtection };