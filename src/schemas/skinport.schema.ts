import { z } from 'zod';

export const skinportItemSchema = z.object({
  market_hash_name: z.string(),
  currency: z.string(),
  suggested_price: z.number().nullable(),
  item_page: z.string(),
  market_page: z.string(),
  min_price: z.number().nullable(),
  max_price: z.number().nullable(),
  mean_price: z.number().nullable(),
  median_price: z.number().nullable(),
  quantity: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const mergedItemSchema = z.object({
  market_hash_name: z.string(),
  currency: z.string(),
  suggested_price: z.number().nullable(),
  item_page: z.string(),
  market_page: z.string(),
  min_price_tradable: z.number().nullable(),
  min_price_nontradable: z.number().nullable(),
  quantity_tradable: z.number(),
  quantity_nontradable: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});

export type SkinportItem = z.infer<typeof skinportItemSchema>;
export type MergedItem = z.infer<typeof mergedItemSchema>;
