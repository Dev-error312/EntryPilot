import { FastifyInstance } from 'fastify';
import { ApplicantController } from './applicant.controller';

export async function applicantRoutes(server: FastifyInstance) {
  const controller = new ApplicantController(server);

  server.post('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.create);

  server.get('/', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.list);

  server.get('/grouped', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.listGrouped);

  server.get('/group/:groupId', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.listByGroup);

  server.get('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getById);

  server.put('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.update);

  server.delete('/:id', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.softDelete);
}
