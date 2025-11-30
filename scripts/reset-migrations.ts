import postgres from 'postgres';
import { getConfig } from '@/config';

const config = getConfig();

const sql = postgres({
  host: config.db.HOST,
  port: Number(config.db.PORT),
  database: config.db.DATABASE,
  username: config.db.USER,
  password: config.db.PASSWORD,
});

async function resetMigrations() {
  try {
    await sql`SET search_path TO ${sql(config.db.SCHEMA)}`;
    await sql`DROP TABLE IF EXISTS migrations CASCADE`;

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset migrations:', error);
    await sql.end();
    process.exit(1);
  }
}

resetMigrations();
