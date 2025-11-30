import postgres from 'postgres';
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { getConfig } from '@/config';

const config = getConfig();

const sql = postgres({
  host: config.db.HOST,
  port: Number(config.db.PORT),
  database: config.db.DATABASE,
  username: config.db.USER,
  password: config.db.PASSWORD,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},
});

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('db', sql);

  fastify.addHook('onClose', async () => {
    await sql.end({ timeout: 5 });
  });

  try {
    await sql`SET search_path TO ${sql(config.db.SCHEMA)}`;
    await sql`SELECT 1`;
    fastify.log.info('Database connection established');
  } catch (error) {
    fastify.log.error({ err: error }, 'Failed to connect to database');
    throw error;
  }
};

export default fp(dbPlugin, {
  name: 'db-plugin',
});

declare module 'fastify' {
  interface FastifyInstance {
    db: postgres.Sql;
  }
}
