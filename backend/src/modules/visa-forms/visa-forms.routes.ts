import { FastifyInstance } from 'fastify';
import { VisaFormsController } from './visa-forms.controller';

export async function visaFormsRoutes(server: FastifyInstance) {
  const controller = new VisaFormsController(server);

  server.post('/', { preHandler: [server.authenticate] }, controller.createForm);
  server.get('/', { preHandler: [server.authenticate] }, controller.listForms);
  server.get('/:id', { preHandler: [server.authenticate] }, controller.getForm);
  server.put('/:id', { preHandler: [server.authenticate] }, controller.updateForm);
  server.post('/:id/submit', { preHandler: [server.authenticate] }, controller.submitForm);
  server.delete('/:id', { preHandler: [server.authenticate] }, controller.deleteForm);
}
