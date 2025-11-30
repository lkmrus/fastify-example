import { FastifyPluginAsync } from 'fastify';

const itemsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const items = await fastify.services.skinport.getItems();
      return reply.status(200).send(items);
    } catch (error) {
      if (error instanceof Error) {
        fastify.log.error({ err: error }, 'Failed to fetch items from Skinport API');
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Failed to fetch items from Skinport API',
          details: error.message,
        });
      }

      fastify.log.error({ err: error }, 'Unexpected error');
      return reply.status(500).send({
        error: 'Internal server error',
      });
    }
  });
};

export default itemsRoutes;
