import { FastifyInstance } from 'fastify';
import { AuditController } from './audit.controller';

export async function auditRoutes(server: FastifyInstance) {
  const controller = new AuditController(server);

  server.get('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.list);

  server.get('/entity/:type/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.listByEntity);

  server.get('/user/:userId', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.listByUser);
}
