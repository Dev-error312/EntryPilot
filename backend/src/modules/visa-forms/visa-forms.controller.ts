import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VisaFormsService } from './visa-forms.service';

export class VisaFormsController {
  private service: VisaFormsService;

  constructor(private server: FastifyInstance) {
    this.service = new VisaFormsService(this.server.prisma);
  }

  createForm = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId } = request.user as any;
      const data = request.body as any;

      const errors = this.service.validateRequiredFields(data);
      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      const form = await this.service.createForm(data, organizationId, data.groupId);
      return reply.status(201).send({ success: true, form });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  listForms = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId } = request.user as any;
      const { page = 1, limit = 20, groupId } = request.query as any;

      const result = await this.service.listForms(
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

  getForm = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const form = await this.service.getForm(id);

      if (!form) {
        return reply.status(404).send({ success: false, error: 'Form not found' });
      }

      return reply.send({ success: true, form });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  updateForm = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const data = request.body as any;

      const form = await this.service.updateForm(id, data);
      return reply.send({ success: true, form });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  submitForm = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const form = await this.service.submitForm(id);

      return reply.send({ success: true, form });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  deleteForm = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      await this.service.deleteForm(id);

      return reply.send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };
}
