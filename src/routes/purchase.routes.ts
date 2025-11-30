import { FastifyPluginAsync } from 'fastify';
import { createPurchaseBodySchema } from '../schemas/purchase.schema';

const purchaseRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    try {
      const validatedBody = createPurchaseBodySchema.parse(request.body);
      const { user_id, product_id, quantity } = validatedBody;

      const result = await fastify.services.purchase.createPurchase(
        user_id,
        product_id,
        quantity,
      );

      return reply.status(201).send(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          message: 'Invalid request body',
          details: error,
        });
      }

      if (error instanceof Error) {
        switch (error.message) {
          case 'USER_NOT_FOUND':
            return reply.status(404).send({
              error: 'User not found',
            });

          case 'PRODUCT_NOT_FOUND':
            return reply.status(404).send({
              error: 'Product not found',
            });

          case 'INSUFFICIENT_FUNDS':
            return reply.status(400).send({
              error: 'Insufficient funds',
              message: 'User does not have enough balance to complete this purchase',
            });

          case 'INSUFFICIENT_STOCK':
            return reply.status(409).send({
              error: 'Insufficient stock',
              message: 'Not enough product stock available',
            });

          default:
            fastify.log.error({ err: error }, 'Purchase error');
            return reply.status(500).send({
              error: 'Internal server error',
              message: 'Failed to process purchase',
            });
        }
      }

      fastify.log.error({ err: error }, 'Unexpected error');
      return reply.status(500).send({
        error: 'Internal server error',
      });
    }
  });
};

export default purchaseRoutes;
