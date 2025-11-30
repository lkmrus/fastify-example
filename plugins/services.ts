import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { ProductService } from '@/services/product.service';
import { PurchaseService } from '@/services/purchase.service';
import { SkinportService } from '@/services/skinport.service';
import { UserRepository } from '@/repositories/user.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { PurchaseRepository } from '@/repositories/purchase.repository';

const servicesPlugin: FastifyPluginAsync = async (fastify) => {
  const userRepo = new UserRepository(fastify.db);
  const productRepo = new ProductRepository(fastify.db);
  const purchaseRepo = new PurchaseRepository(fastify.db);

  const productService = new ProductService(productRepo);
  const purchaseService = new PurchaseService(fastify.db, userRepo, productRepo, purchaseRepo);
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
