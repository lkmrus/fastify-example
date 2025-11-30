import postgres from 'postgres';
import { ProductRepository } from '../repositories/product.repository';

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async getProductWithLock(productId: number, transaction: postgres.Sql) {
    return this.productRepo.findByIdWithLock(productId, transaction);
  }

  async updateStock(productId: number, newStock: number, transaction: postgres.Sql) {
    return this.productRepo.updateStock(productId, newStock, transaction);
  }
}
