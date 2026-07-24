const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.FILE_ENCRYPTION_KEY, 'hex'); // 32 byte key from env

const encryptBuffer = (buffer) => {
  const iv = crypto.randomBytes(12); // unique iv per file, never reused with same key
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag(); // gcm gives us tamper detection for free
  return Buffer.concat([iv, authTag, encrypted]); // store iv and tag alongside the ciphertext
};

const decryptBuffer = (data) => {
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

module.exports = { encryptBuffer, decryptBuffer };