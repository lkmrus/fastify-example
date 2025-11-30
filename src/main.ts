import fastify from 'fastify';
import { getConfig } from './config';

import cachePlugin from '../plugins/cache-plugin';
import dbPlugin from '../plugins/db';
import servicesPlugin from '../plugins/services';

import purchaseRoutes from './routes/purchase.routes';

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

server.setErrorHandler((error, request, reply) => {
  server.log.error({ err: error }, 'Request error');

  const statusCode = (error as any).statusCode || 500;
  const errorName = (error as Error).name || 'Internal Server Error';
  const errorMessage = (error as Error).message || 'An unexpected error occurred';

  reply.status(statusCode).send({
    error: errorName,
    message: errorMessage,
  });
});

async function startServer() {
  try {
    await server.register(cachePlugin);
    await server.register(dbPlugin);
    await server.register(servicesPlugin);
    await server.register(purchaseRoutes, { prefix: '/purchases' });

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
