const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect, requireRole } = require('../middleware/auth');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, (req, res) => {
  res.status(200).json({ email: req.user.universityEmail, role: req.user.role });
});

router.get('/admin-only', protect, requireRole('admin'), (req, res) => {
  res.status(200).json({ message: 'You are an admin' });
});
module.exports = router;

