import { FastifyPluginAsync } from 'fastify';
import { createPurchaseBodySchema } from '../schemas/purchase.schema';

const purchaseRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const validatedBody = createPurchaseBodySchema.parse(request.body);
    const { user_id, product_id, quantity } = validatedBody;

    const result = await fastify.services.purchase.createPurchase(user_id, product_id, quantity);

    return reply.status(201).send(result);
  });
};

export default purchaseRoutes;
