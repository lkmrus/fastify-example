import fastify from 'fastify';
import { getConfig } from './config';
import { ZodError } from 'zod';
import { AxiosError } from 'axios';
import { AppError } from './errors';

import cachePlugin from '@plugins/cache-plugin';
import dbPlugin from '@plugins/db';
import skinportPlugin from '@plugins/skinport-plugin';
import servicesPlugin from '@plugins/services';

import purchaseRoutes from './routes/purchase.routes';
import itemsRoutes from './routes/items.routes';

const config = getConfig();

const server = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

server.setErrorHandler((error: unknown, request, reply) => {
  if (error instanceof AppError) {
    server.log.warn({ err: error, code: error.code }, 'Application error');
    return reply.status(error.statusCode).send({
      error: error.code || error.name,
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    server.log.warn({ err: error }, 'Validation error');
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors,
    });
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, any>;

    if ('code' in err && typeof err.code === 'string') {
      server.log.error({ err: error, code: err.code }, 'Database error');

      if (err.code === '23505') {
        return reply.status(409).send({
          error: 'CONFLICT',
          message: 'Resource already exists',
        });
      }

      if (err.code === '23503') {
        return reply.status(400).send({
          error: 'BAD_REQUEST',
          message: 'Invalid reference to related resource',
        });
      }

      return reply.status(500).send({
        error: 'DATABASE_ERROR',
        message: 'Database operation failed',
      });
    }
  }

  if (error instanceof AxiosError) {
    server.log.error({ err: error, url: error.config?.url }, 'External API error');
    return reply.status(503).send({
      error: 'SERVICE_UNAVAILABLE',
      message: 'External service is temporarily unavailable',
    });
  }

  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const err = error as Record<string, any>;
    if (typeof err.statusCode === 'number') {
      server.log.warn({ err: error }, 'Fastify error');
      return reply.status(err.statusCode).send({
        error: err.name || 'Error',
        message: err.message || 'Unknown error',
      });
    }
  }

  server.log.fatal({ err: error }, 'Unexpected error');
  return reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
});

async function startServer() {
  try {
    await server.register(cachePlugin);
    await server.register(dbPlugin);
    await server.register(skinportPlugin);
    await server.register(servicesPlugin);
    await server.register(purchaseRoutes, { prefix: '/purchases' });
    await server.register(itemsRoutes, { prefix: '/items' });

    server.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await server.listen({
      port: config.app.PORT,
      host: '0.0.0.0',
    });

    server.log.info(`Server listening at http://0.0.0.0:${config.app.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}, closing server gracefully`);

  try {
    await server.close();
    server.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    server.log.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
