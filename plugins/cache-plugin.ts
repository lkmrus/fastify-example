import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import Cache from './cache';

const cachePlugin: FastifyPluginAsync = async (fastify) => {
  const cache = new Cache();

  try {
    await cache.connection.connect();
    fastify.log.info('Redis connection established');
  } catch (error) {
    fastify.log.error({ err: error }, 'Failed to connect to Redis');
    throw error;
  }

  fastify.decorate('cache', cache);

  fastify.addHook('onClose', async () => {
    await cache.connection.quit();
    fastify.log.info('Redis connection closed');
  });
};

export default fp(cachePlugin, {
  name: 'cache-plugin',
});

declare module 'fastify' {
  interface FastifyInstance {
    cache: Cache;
  }
}
