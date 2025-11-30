import dotenv from 'dotenv';
import { Config } from './config.types';
dotenv.config();

export function getConfig(): Config {
  return {
    app: {
      PORT: Number(process.env.PORT || 3000),
    },
    redis: {
      HOST: process.env.REDIS_HOST || 'localhost',
      PORT: Number(process.env.REDIS_PORT || '6379'),
    },
    db: {
      HOST: process.env.DB_HOST || 'postgres',
      PORT: process.env.DB_PORT || '5432',
      USER: process.env.DB_USERNAME || 'postgres',
      PASSWORD: process.env.DB_PASSWORD || 'postgres',
      DATABASE: process.env.DB_DATABASE || 'postgres',
      SCHEMA: process.env.DB_SCHEMA || 'public',
    },
  };
}
