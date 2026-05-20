import { FastifyInstance } from 'fastify';
import { visaDocumentController } from './visa-document.controller';

export async function visaDocumentRoutes(app: FastifyInstance) {
  app.post('/', { onRequest: [app.authenticate] }, 
    (request, reply) => visaDocumentController.create(request, reply));
  
  app.get('/', { onRequest: [app.authenticate] }, 
    (request, reply) => visaDocumentController.list(request, reply));
  
  app.delete('/:id', { onRequest: [app.authenticate] }, 
    (request, reply) => visaDocumentController.delete(request, reply));
}
