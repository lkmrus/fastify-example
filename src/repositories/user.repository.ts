import postgres from 'postgres';
import { User } from '../types';

export class UserRepository {
  constructor(private db: postgres.Sql) {}

  async findByIdWithLock(userId: number, transaction: postgres.Sql): Promise<User | null> {
    const [user] = await transaction<User[]>`
      SELECT * FROM users WHERE id = ${userId} FOR UPDATE
    `;
    return user || null;
  }

  async updateBalance(
    userId: number,
    newBalance: string,
    transaction: postgres.Sql,
  ): Promise<void> {
    await transaction`
      UPDATE users
      SET balance = ${newBalance}
      WHERE id = ${userId}
    `;
  }
}
