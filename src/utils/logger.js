const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(), // structured logs, queryable later not just plain text
  ),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '..', '..', 'logs', 'audit.log') }),
    new winston.transports.Console({ format: winston.format.simple() }), // readable output during dev
  ],
});

// helper for consistent security event shape across the whole app
const logSecurityEvent = (event, details = {}) => {
  logger.info({
    event, // eg login_success, login_failed, role_changed, dispute_resolved
    timestamp: new Date().toISOString(),
    ...details, // never pass passwordHash, mfaSecret, or full documents here
  });
};

module.exports = { logger, logSecurityEvent };