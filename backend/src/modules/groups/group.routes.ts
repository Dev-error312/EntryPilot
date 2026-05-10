import { FastifyInstance } from 'fastify';
import { GroupController } from './group.controller';

export async function groupRoutes(server: FastifyInstance) {
  const controller = new GroupController(server);

  server.post('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.create);

  server.get('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.list);

  server.get('/active', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.listActive);

  server.get('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getById);

  server.put('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.update);

  server.post('/:id/assign', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.assignEmployee);

  server.patch('/:id/archive', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.archive);
}
