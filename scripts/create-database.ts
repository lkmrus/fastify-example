import postgres from 'postgres';
import { getConfig } from '@/config';

const config = getConfig();

async function createDatabase() {
  const sql = postgres({
    host: config.db.HOST,
    port: Number(config.db.PORT),
    username: config.db.USER,
    password: config.db.PASSWORD,
    database: 'postgres',
  });

  try {
    const dbName = config.db.DATABASE;

    const [result] = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    if (!result) {
      await sql.unsafe(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Failed to create database:', error);
    await sql.end();
    process.exit(1);
  }
}

createDatabase();
