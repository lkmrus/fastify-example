import { migrate } from 'postgres-migrations';
import { getConfig } from '../src/config';
import path from 'path';
import postgres from 'postgres';

const config = getConfig();

const dbConfig = {
  host: config.db.HOST,
  port: Number(config.db.PORT),
  database: config.db.DATABASE,
  user: config.db.USER,
  password: config.db.PASSWORD,
};

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    const sql = postgres(dbConfig);

    if (config.db.SCHEMA !== 'public') {
      await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${config.db.SCHEMA}`);
    }

    await sql.end();

    const migrationsPath = path.join(__dirname, '../db/migrations');

    await migrate(dbConfig, migrationsPath, {
      logger: (msg) => console.log(msg),
    });

    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
