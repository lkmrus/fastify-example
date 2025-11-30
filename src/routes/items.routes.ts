import { FastifyPluginAsync } from 'fastify';

const itemsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const items = await fastify.services.skinport.getItems();
    return reply.status(200).send(items);
  });
};

export default itemsRoutes;
