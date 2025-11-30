import postgres from 'postgres';
import { CreatePurchaseResponse } from '../types';
import { ProductRepository } from '../repositories/product.repository';
import { UserRepository } from '../repositories/user.repository';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { NotFoundError, InsufficientStockError, InsufficientFundsError } from '../errors';

export class PurchaseService {
  constructor(
    private db: postgres.Sql,
    private userRepo: UserRepository,
    private productRepo: ProductRepository,
    private purchaseRepo: PurchaseRepository,
  ) {}

  async createPurchase(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CreatePurchaseResponse> {
    return await this.db.begin(async (transaction) => {
      const product = await this.productRepo.findByIdWithLock(productId, transaction);

      if (!product) {
        throw new NotFoundError('Product');
      }

      if (product.stock < quantity) {
        throw new InsufficientStockError();
      }

      const user = await this.userRepo.findByIdWithLock(userId, transaction);

      if (!user) {
        throw new NotFoundError('User');
      }

      const pricePerUnit = parseFloat(product.price);
      const totalAmount = pricePerUnit * quantity;

      const userBalance = parseFloat(user.balance);
      if (userBalance < totalAmount) {
        throw new InsufficientFundsError();
      }

      const newStock = product.stock - quantity;
      await this.productRepo.updateStock(productId, newStock, transaction);

      const newBalance = userBalance - totalAmount;
      await this.userRepo.updateBalance(userId, newBalance, transaction);

      const purchaseId = await this.purchaseRepo.create(
        {
          user_id: userId,
          product_id: productId,
          quantity,
          price_at_purchase: pricePerUnit,
          total_amount: totalAmount,
        },
        transaction,
      );

      return {
        success: true,
        purchase_id: purchaseId,
        new_balance: newBalance.toFixed(2),
        product_name: product.name,
        total_paid: totalAmount.toFixed(2),
      };
    });
  }
}
