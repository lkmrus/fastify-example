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

async function dropDatabase() {
  try {
    console.log('Dropping all tables...');

    await sql`SET search_path TO ${sql(config.db.SCHEMA)}`;

    await sql`DROP TABLE IF EXISTS purchases CASCADE`;
    await sql`DROP TABLE IF EXISTS products CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    await sql`DROP TABLE IF EXISTS migrations CASCADE`;

    await sql`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`;

    console.log('All tables dropped successfully');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Failed to drop database:', error);
    await sql.end();
    process.exit(1);
  }
}

dropDatabase();
