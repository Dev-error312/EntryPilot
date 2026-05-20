import { FastifyInstance } from 'fastify';
import { batchTemplateController } from './batch-template.controller';

export async function batchTemplateRoutes(app: FastifyInstance) {
  app.post('/', { onRequest: [app.authenticate] }, 
    (request, reply) => batchTemplateController.create(request, reply));
  
  app.get('/', { onRequest: [app.authenticate] }, 
    (request, reply) => batchTemplateController.list(request, reply));
  
  app.get('/:id', { onRequest: [app.authenticate] }, 
    (request, reply) => batchTemplateController.get(request, reply));
  
  app.patch('/:id', { onRequest: [app.authenticate] }, 
    (request, reply) => batchTemplateController.update(request, reply));
  
  app.delete('/:id', { onRequest: [app.authenticate] }, 
    (request, reply) => batchTemplateController.delete(request, reply));
}
