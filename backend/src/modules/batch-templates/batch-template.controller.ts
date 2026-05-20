import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BatchTemplateService } from './batch-template.service';

export class BatchTemplateController {
  private service: BatchTemplateService;

  constructor(private server: FastifyInstance) {
    this.service = new BatchTemplateService(this.server.prisma);
  }

  createTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, id: userId } = request.user as any;
      const data = request.body as any;

      const template = await this.service.createTemplate(
        data,
        organizationId,
        data.groupId,
        userId
      );

      return reply.status(201).send({ success: true, template });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  listTemplates = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId } = request.user as any;
      const { page = 1, limit = 20, groupId } = request.query as any;

      const result = await this.service.listTemplates(
        organizationId,
        groupId,
        parseInt(page),
        parseInt(limit)
      );

      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  getTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const template = await this.service.getTemplate(id);

      if (!template) {
        return reply.status(404).send({ success: false, error: 'Template not found' });
      }

      return reply.send({ success: true, template });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  updateTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const data = request.body as any;

      const template = await this.service.updateTemplate(id, data);
      return reply.send({ success: true, template });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  deleteTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      await this.service.deleteTemplate(id);

      return reply.send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  getGroupTemplates = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { groupId } = request.params as any;
      const templates = await this.service.getTemplatesByGroup(groupId);

      return reply.send({ success: true, templates });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };
}
