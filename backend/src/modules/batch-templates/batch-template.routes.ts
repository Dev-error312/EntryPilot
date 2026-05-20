import { FastifyInstance } from 'fastify';
import { BatchTemplateController } from './batch-template.controller';

export async function batchTemplateRoutes(server: FastifyInstance) {
  const controller = new BatchTemplateController(server);

  server.post('/', { preHandler: [server.authenticate] }, controller.createTemplate);
  server.get('/', { preHandler: [server.authenticate] }, controller.listTemplates);
  server.get('/:id', { preHandler: [server.authenticate] }, controller.getTemplate);
  server.put('/:id', { preHandler: [server.authenticate] }, controller.updateTemplate);
  server.delete('/:id', { preHandler: [server.authenticate] }, controller.deleteTemplate);
  server.get('/group/:groupId', { preHandler: [server.authenticate] }, controller.getGroupTemplates);
}
