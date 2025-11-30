import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { SkinportClient } from './skinport-client';

const skinportPlugin: FastifyPluginAsync = async (fastify) => {
  const skinportClient = new SkinportClient();

  fastify.decorate('skinportClient', skinportClient);

  fastify.log.info('Skinport client registered');
};

export default fp(skinportPlugin, {
  name: 'skinport-plugin',
});

declare module 'fastify' {
  interface FastifyInstance {
    skinportClient: SkinportClient;
  }
}

