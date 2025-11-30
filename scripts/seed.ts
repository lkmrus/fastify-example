import postgres from 'postgres';
import { getConfig } from '@/config';
import fs from 'fs';
import path from 'path';

const config = getConfig();

const sql = postgres({
  host: config.db.HOST,
  port: Number(config.db.PORT),
  database: config.db.DATABASE,
  username: config.db.USER,
  password: config.db.PASSWORD,
});

async function runSeeds() {
  try {
    console.log('Running database seeds...');

    await sql`SET search_path TO ${sql(config.db.SCHEMA)}`;

    const seedFilePath = path.join(__dirname, '../db/seeds/products.sql');
    const seedSQL = fs.readFileSync(seedFilePath, 'utf-8');

    await sql.unsafe(seedSQL);

    console.log('Seeds completed successfully');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runSeeds();
