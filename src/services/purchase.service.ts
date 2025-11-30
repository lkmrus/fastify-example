import postgres from 'postgres';
import { User, CreatePurchaseResponse } from '../types';
import { ProductService } from './product.service';

export class PurchaseService {
  constructor(
    private db: postgres.Sql,
    private productService: ProductService,
  ) {}

  async createPurchase(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CreatePurchaseResponse> {
    return await this.db.begin(async (transaction) => {
      // 1. Получить товар с блокировкой
      const product = await this.productService.getProductWithLock(productId, transaction);

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      // 2. Проверить наличие на складе
      if (product.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      // 3. Получить пользователя с блокировкой
      const [user] = await transaction<User[]>`
        SELECT * FROM users WHERE id = ${userId} FOR UPDATE
      `;

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // 4. Вычислить стоимость
      const pricePerUnit = parseFloat(product.price);
      const totalAmount = pricePerUnit * quantity;

      // 5. Проверить баланс
      const userBalance = parseFloat(user.balance);
      if (userBalance < totalAmount) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // 6. Обновить stock товара
      const newStock = product.stock - quantity;
      await this.productService.updateStock(productId, newStock, transaction);

      // 7. Списать с баланса пользователя
      const newBalance = userBalance - totalAmount;
      await transaction`
        UPDATE users
        SET balance = ${newBalance.toFixed(2)}
        WHERE id = ${userId}
      `;

      // 8. Создать запись о покупке
      const [purchase] = await transaction<{ id: number }[]>`
        INSERT INTO purchases (
          user_id,
          product_id,
          quantity,
          price_at_purchase,
          total_amount
        ) VALUES (
          ${userId},
          ${productId},
          ${quantity},
          ${pricePerUnit.toFixed(2)},
          ${totalAmount.toFixed(2)}
        )
        RETURNING id
      `;

      // 9. Вернуть результат
      return {
        success: true,
        purchase_id: purchase.id,
        new_balance: newBalance.toFixed(2),
        product_name: product.name,
        total_paid: totalAmount.toFixed(2),
      };
    });
  }
}
