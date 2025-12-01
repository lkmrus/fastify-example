import { FastifyPluginAsync } from 'fastify';
import { createPurchaseBodySchema } from '../schemas/purchase.schema';

const purchaseRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const validatedBody = createPurchaseBodySchema.parse(request.body);
    const { user_id, product_id, quantity } = validatedBody;

    const idempotencyKey = request.headers['idempotency-key'] as string | undefined;
    const result = await fastify.services.purchase.createPurchase(
      user_id,
      product_id,
      quantity,
      idempotencyKey,
    );

    return reply.status(201).send(result);
  });
};

export default purchaseRoutes;
