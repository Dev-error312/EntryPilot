import { FastifyInstance } from 'fastify';
import { visaApplicationController } from './visa-application.controller';

export async function visaApplicationRoutes(app: FastifyInstance) {
  app.post('/', { onRequest: [app.authenticate] }, 
    (request, reply) => visaApplicationController.create(request, reply));
  
  app.get('/', { onRequest: [app.authenticate] }, 
    (request, reply) => visaApplicationController.list(request, reply));
  
  app.get('/:id', { onRequest: [app.authenticate] }, 
    (request, reply) => visaApplicationController.get(request, reply));
  
  app.post('/:id/approve', { onRequest: [app.authenticate] }, 
    (request, reply) => visaApplicationController.approve(request, reply));
  
  app.post('/:id/reject', { onRequest: [app.authenticate] }, 
    (request, reply) => visaApplicationController.reject(request, reply));
}
