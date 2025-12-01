import postgres from 'postgres';

export interface CreatePurchaseData {
  user_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: string;
  total_amount: string;
}

export class PurchaseRepository {
  constructor(private db: postgres.Sql) {}

  async create(data: CreatePurchaseData, transaction: postgres.Sql): Promise<number> {
    const [purchase] = await transaction<{ id: number }[]>`
      INSERT INTO purchases (
        user_id,
        product_id,
        quantity,
        price_at_purchase,
        total_amount
      ) VALUES (
        ${data.user_id},
        ${data.product_id},
        ${data.quantity},
        ${data.price_at_purchase},
        ${data.total_amount}
      )
      RETURNING id
    `;
    return purchase.id;
  }
}
