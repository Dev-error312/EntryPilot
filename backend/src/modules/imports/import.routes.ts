import { FastifyInstance } from 'fastify';
import { ImportController } from './import.controller';

export async function importRoutes(server: FastifyInstance) {
  const controller = new ImportController(server);

  // Get field definitions
  server.get('/fields', controller.getFields);

  // Upload file
  server.post('/upload', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.upload);

  // List imports
  server.get('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.list);

  // Get import by ID
  server.get('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getById);

  // Delete import and associated applicants
  server.delete('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.delete);

  // Get applicants from an import
  server.get('/:id/applicants', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getApplicants);

  // Process import
  server.post('/:id/process', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.process);

  // Get import results
  server.get('/:id/results', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getResults);
}
