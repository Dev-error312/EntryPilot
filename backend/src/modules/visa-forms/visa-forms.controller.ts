import { FastifyRequest, FastifyReply } from 'fastify';
import { visaFormsService } from './visa-forms.service';

export class VisaFormsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      
      const visaForm = await visaFormsService.createVisaForm(
        request.body,
        organizationId
      );

      reply.code(201).send({
        success: true,
        data: visaForm,
        message: 'Visa form created successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      const visaForm = await visaFormsService.getVisaForm(id, organizationId);

      if (!visaForm) {
        return reply.code(404).send({
          success: false,
          error: 'Visa form not found'
        });
      }

      reply.send({
        success: true,
        data: visaForm
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { groupId } = request.query as any;

      const visaForms = await visaFormsService.listVisaForms(organizationId, groupId);

      reply.send({
        success: true,
        data: visaForms,
        count: visaForms.length
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      const visaForm = await visaFormsService.updateVisaForm(
        id,
        request.body,
        organizationId
      );

      reply.send({
        success: true,
        data: visaForm,
        message: 'Visa form updated successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async submit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      const visaForm = await visaFormsService.submitVisaForm(id, organizationId);

      reply.send({
        success: true,
        data: visaForm,
        message: 'Visa form submitted successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      await visaFormsService.deleteVisaForm(id, organizationId);

      reply.send({
        success: true,
        message: 'Visa form deleted successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }
}

export const visaFormsController = new VisaFormsController();
