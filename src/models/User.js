const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  universityEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'], // basic format check, real verification is separate
  },
  passwordHash: {
    type: String,
    required: true,
    select: false, // excluded from queries by default, must opt-in with .select('+passwordHash')
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['unverified', 'verified', 'moderator', 'admin'], // whitelist, nothing else accepted
    default: 'unverified',
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  studentIdDocPath: {
    type: String, // path to encrypted uploaded ID doc, set after upload
    select: false,
  },

  // MFA fields
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String, // TOTP secret, only set once MFA is enabled
    select: false,
  },

  //  Brute-force protection fields 
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date, // if set and in future, account is locked
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// hash password before saving, only if it was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12); // cost factor 12, slow enough to resist brute-force
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// instance method to check password on login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// virtual to check if account is currently locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);