const { z } = require('zod');

exports.createUserSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
});