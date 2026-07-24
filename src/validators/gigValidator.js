const { z } = require('zod');

const createGigSchema = z.object({
  title: z.string().min(5).max(100).trim(),
  description: z.string().min(20).max(2000).trim(),
  category: z.enum(['tutoring', 'design', 'coding', 'writing', 'editing', 'other']),
  price: z.number().min(1).max(10000),
  deliveryDays: z.number().min(1).max(90),
});

module.exports = { createGigSchema };