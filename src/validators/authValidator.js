const { z } = require('zod');

// enforces password strength before it ever reaches the database
const passwordSchema = z.string()
  .min(10, 'Password must be at least 10 characters') // length requirement
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

const registerSchema = z.object({
  universityEmail: z.string().email().max(100), // max length prevents oversized payloads
  password: passwordSchema,
  fullName: z.string().min(2).max(80).trim(),
});

const loginSchema = z.object({
  universityEmail: z.string().email().max(100),
  password: z.string().min(1).max(200), // no strength check on login just presence
});

module.exports = { registerSchema, loginSchema, passwordSchema };