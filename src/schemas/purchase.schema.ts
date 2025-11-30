import { z } from 'zod';

export const createPurchaseBodySchema = z.object({
  user_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const createPurchaseResponseSchema = z.object({
  success: z.boolean(),
  purchase_id: z.number(),
  new_balance: z.string(),
  product_name: z.string(),
  total_paid: z.string(),
});

export type CreatePurchaseBody = z.infer<typeof createPurchaseBodySchema>;
export type CreatePurchaseResponse = z.infer<typeof createPurchaseResponseSchema>;
