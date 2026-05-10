import { FastifyInstance } from 'fastify';
import { TemplateController } from './template.controller';

export async function templateRoutes(server: FastifyInstance) {
  const controller = new TemplateController(server);

  server.post('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.create);

  server.get('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.list);

  server.get('/country/:country', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.listByCountry);

  server.get('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getById);

  server.put('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.update);

  server.patch('/:id/toggle', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.toggleActive);
}
