import fastify from 'fastify';
import { getConfig } from './config';
import { error, log } from 'console';

const config = getConfig();

const server = fastify();

server.listen({ port: config.app.PORT }, (err, address) => {
  if (err) {
    error(err);
    process.exit(1);
  }
  log(`Server listening at ${address}`);
});
