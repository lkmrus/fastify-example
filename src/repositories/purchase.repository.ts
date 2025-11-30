import postgres from 'postgres';

export interface CreatePurchaseData {
  user_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  total_amount: number;
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
        ${data.price_at_purchase.toFixed(2)},
        ${data.total_amount.toFixed(2)}
      )
      RETURNING id
    `;
    return purchase.id;
  }
}
