import { FastifyInstance } from 'fastify';
import { visaFormsController } from './visa-forms.controller';

export async function visaFormsRoutes(app: FastifyInstance) {
  app.post('/', {
    onRequest: [app.authenticate]
  }, (request, reply) => visaFormsController.create(request, reply));

  app.get('/', {
    onRequest: [app.authenticate]
  }, (request, reply) => visaFormsController.list(request, reply));

  app.get('/:id', {
    onRequest: [app.authenticate]
  }, (request, reply) => visaFormsController.get(request, reply));

  app.patch('/:id', {
    onRequest: [app.authenticate]
  }, (request, reply) => visaFormsController.update(request, reply));

  app.post('/:id/submit', {
    onRequest: [app.authenticate]
  }, (request, reply) => visaFormsController.submit(request, reply));

  app.delete('/:id', {
    onRequest: [app.authenticate]
  }, (request, reply) => visaFormsController.delete(request, reply));
}
