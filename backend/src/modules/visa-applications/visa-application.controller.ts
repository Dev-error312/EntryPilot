import { FastifyRequest, FastifyReply } from 'fastify';
import { visaApplicationService } from './visa-application.service';

export class VisaApplicationController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { formId, templateId } = request.body as any;
      const app = await visaApplicationService.createApplication(formId, templateId, user.organizationId);
      reply.code(201).send({ success: true, data: app });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as any;
      const app = await visaApplicationService.get(id, user.organizationId);
      if (!app) return reply.code(404).send({ success: false, error: 'Application not found' });
      reply.send({ success: true, data: app });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { groupId } = request.query as any;
      const apps = await visaApplicationService.list(user.organizationId, groupId);
      reply.send({ success: true, data: apps, count: apps.length });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async approve(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as any;
      const app = await visaApplicationService.approve(id, user.id);
      reply.send({ success: true, data: app });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async reject(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as any;
      const { reason } = request.body as any;
      const app = await visaApplicationService.reject(id, reason, user.id);
      reply.send({ success: true, data: app });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }
}

export const visaApplicationController = new VisaApplicationController();
