import { FastifyRequest, FastifyReply } from 'fastify';
import { batchTemplateService } from './batch-template.service';

export class BatchTemplateController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const template = await batchTemplateService.create(request.body, user.organizationId);
      reply.code(201).send({ success: true, data: template });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as any;
      const template = await batchTemplateService.get(id, user.organizationId);
      if (!template) return reply.code(404).send({ success: false, error: 'Template not found' });
      reply.send({ success: true, data: template });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { groupId } = request.query as any;
      const templates = await batchTemplateService.list(user.organizationId, groupId);
      reply.send({ success: true, data: templates, count: templates.length });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const template = await batchTemplateService.update(id, request.body);
      reply.send({ success: true, data: template });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      await batchTemplateService.delete(id);
      reply.send({ success: true, message: 'Template deleted' });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }
}

export const batchTemplateController = new BatchTemplateController();
