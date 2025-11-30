import postgres from 'postgres';
import { Product } from '../types';

export class ProductRepository {
  constructor(private db: postgres.Sql) {}

  async findByIdWithLock(productId: number, transaction: postgres.Sql): Promise<Product | null> {
    const [product] = await transaction<Product[]>`
      SELECT * FROM products WHERE id = ${productId} FOR UPDATE
    `;
    return product || null;
  }

  async updateStock(productId: number, newStock: number, transaction: postgres.Sql): Promise<void> {
    await transaction`
      UPDATE products
      SET stock = ${newStock}
      WHERE id = ${productId}
    `;
  }
}
