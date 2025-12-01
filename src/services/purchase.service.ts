import postgres from 'postgres';
import Decimal from 'decimal.js';
import Cache from '../../plugins/cache';
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
    private cache: Cache,
  ) {}

  private normalizeMoney(amount: Decimal): Decimal {
    const rounded = amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    if (rounded.lessThan(new Decimal('0.01'))) {
      return new Decimal('0.01');
    }
    return rounded;
  }

  async createPurchase(
    userId: number,
    productId: number,
    quantity: number,
    idempotencyKey?: string,
  ): Promise<CreatePurchaseResponse> {
    if (idempotencyKey) {
      const cached = await this.cache.get<CreatePurchaseResponse>(`idempotency:${idempotencyKey}`);
      if (cached) {
        return cached;
      }
    }

    const result = await this.db.begin(async (transaction) => {
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

      const pricePerUnit = new Decimal(product.price);
      const totalAmount = this.normalizeMoney(pricePerUnit.times(quantity));

      const userBalance = new Decimal(user.balance);
      if (userBalance.lessThan(totalAmount)) {
        throw new InsufficientFundsError();
      }

      const newStock = product.stock - quantity;
      await this.productRepo.updateStock(productId, newStock, transaction);

      const newBalance = this.normalizeMoney(userBalance.minus(totalAmount));
      await this.userRepo.updateBalance(userId, newBalance.toString(), transaction);

      const purchaseId = await this.purchaseRepo.create(
        {
          user_id: userId,
          product_id: productId,
          quantity,
          price_at_purchase: pricePerUnit.toString(),
          total_amount: totalAmount.toString(),
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

    if (idempotencyKey) {
      await this.cache.set(`idempotency:${idempotencyKey}`, result, 86400);
    }

    return result;
  }
}
