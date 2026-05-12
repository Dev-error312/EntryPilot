import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller';

export async function userRoutes(server: FastifyInstance) {
  const controller = new UserController(server);

  server.post('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.create);

  server.get('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.list);

  server.get('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getById);

  server.put('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.update);

  server.patch('/:id/toggle', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.toggleActive);

  server.delete('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.delete);
}
