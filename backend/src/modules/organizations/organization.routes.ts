import { FastifyInstance } from 'fastify';
import { OrganizationController } from './organization.controller';

export async function organizationRoutes(server: FastifyInstance) {
  const controller = new OrganizationController(server);

  // Super Admin routes
  server.post('/', { 
    preHandler: [server.authenticate] 
  }, controller.create);

  server.get('/', { 
    preHandler: [server.authenticate] 
  }, controller.list);

  server.get('/:id', { 
    preHandler: [server.authenticate] 
  }, controller.getById);

  server.put('/:id', { 
    preHandler: [server.authenticate] 
  }, controller.update);

  server.patch('/:id/toggle', { 
    preHandler: [server.authenticate] 
  }, controller.toggleActive);

  server.get('/:id/stats', { 
    preHandler: [server.authenticate] 
  }, controller.getStats);
}
