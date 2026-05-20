import { FastifyInstance } from 'fastify';
import { VisaDocumentController } from './visa-document.controller';

export async function visaDocumentRoutes(server: FastifyInstance) {
  const controller = new VisaDocumentController(server);

  server.post('/upload', { preHandler: [server.authenticate] }, controller.uploadDocument);
  server.get('/', { preHandler: [server.authenticate] }, controller.listDocuments);
  server.get('/:id', { preHandler: [server.authenticate] }, controller.getDocument);
  server.delete('/:id', { preHandler: [server.authenticate] }, controller.deleteDocument);
  server.get('/application/:applicationId', { preHandler: [server.authenticate] }, controller.getApplicationDocuments);
  server.post('/:id/verify', { preHandler: [server.authenticate] }, controller.verifyDocument);
  server.post('/:id/reject', { preHandler: [server.authenticate] }, controller.rejectDocument);
}
