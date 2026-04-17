const { z, email } = require('zod');

exports.createOrderSchema = z.object({
  userId: z.number(),
  amount: z.number().positive(),
  email: z.email(),
});