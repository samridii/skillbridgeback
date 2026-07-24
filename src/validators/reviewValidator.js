const { z } = require('zod');

const createReviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).trim().optional(),
});

module.exports = { createReviewSchema };