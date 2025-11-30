import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { ProductService } from '../src/services/product.service';
import { PurchaseService } from '../src/services/purchase.service';
import { SkinportService } from '../src/services/skinport.service';

const servicesPlugin: FastifyPluginAsync = async (fastify) => {
  const productService = new ProductService(fastify.db);
  const purchaseService = new PurchaseService(fastify.db, productService);
  const skinportService = new SkinportService(fastify.skinportClient, fastify.cache);

  fastify.decorate('services', {
    product: productService,
    purchase: purchaseService,
    skinport: skinportService,
  });

  fastify.log.info('Services registered');
};

export default fp(servicesPlugin, {
  name: 'services-plugin',
  dependencies: ['db-plugin', 'cache-plugin', 'skinport-plugin'],
});

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      product: ProductService;
      purchase: PurchaseService;
      skinport: SkinportService;
    };
  }
}
