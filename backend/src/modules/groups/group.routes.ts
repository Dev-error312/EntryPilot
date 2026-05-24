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

  // Get group by code (optimized lookup)
  server.get('/code/:code', {
    preHandler: [server.authenticate, server.tenantGuard]
  }, async (request, reply) => {
    return controller.getByCode(request as any, reply as any);
  });

  // Get applicants by group (lazy load with pagination)
  server.get('/:id/applicants', {
    preHandler: [server.authenticate, server.tenantGuard]
  }, async (request, reply) => {
    return controller.getGroupApplicants(request as any, reply as any);
  });

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

  server.delete('/:id', {
    preHandler: [server.authenticate, server.tenantGuard]
  }, controller.delete);
}
