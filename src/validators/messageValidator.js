const { z } = require('zod');

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
});

module.exports = { sendMessageSchema };