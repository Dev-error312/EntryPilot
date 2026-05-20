import { FastifyInstance } from 'fastify';
import { VisaApplicationController } from './visa-application.controller';

export async function visaApplicationRoutes(server: FastifyInstance) {
  const controller = new VisaApplicationController(server);

  server.post('/', { preHandler: [server.authenticate] }, controller.createApplication);
  server.get('/', { preHandler: [server.authenticate] }, controller.listApplications);
  server.get('/:id', { preHandler: [server.authenticate] }, controller.getApplication);
  server.put('/:id', { preHandler: [server.authenticate] }, controller.updateApplication);
  server.post('/:id/submit', { preHandler: [server.authenticate] }, controller.submitApplication);
  server.post('/:id/approve', { preHandler: [server.authenticate] }, controller.approveApplication);
  server.post('/:id/reject', { preHandler: [server.authenticate] }, controller.rejectApplication);
  server.delete('/:id', { preHandler: [server.authenticate] }, controller.deleteApplication);
  server.get('/reference/:referenceNumber', { preHandler: [server.authenticate] }, controller.getByReference);
}
