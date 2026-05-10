import { FastifyInstance } from 'fastify';
import { ImportController } from './import.controller';

export async function importRoutes(server: FastifyInstance) {
  const controller = new ImportController(server);

  server.post('/upload', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.upload);

  server.get('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.list);

  server.get('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getById);

  server.post('/:id/process', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.process);

  server.get('/:id/results', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getResults);
}
