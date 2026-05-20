import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VisaMergerService } from './visa-merger.service';
import { VisaApplicationService } from './visa-application.service';

export class VisaApplicationController {
  private mergerService: VisaMergerService;
  private appService: VisaApplicationService;

  constructor(private server: FastifyInstance) {
    this.mergerService = new VisaMergerService(this.server.prisma);
    this.appService = new VisaApplicationService(this.server.prisma);
  }

  createApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as any;
      const application = await this.mergerService.createCompleteApplication(
        data.formDataId,
        data.batchTemplateId,
        data.groupId
      );

      return reply.status(201).send({ success: true, application });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  listApplications = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId } = request.user as any;
      const { page = 1, limit = 20, groupId } = request.query as any;

      const result = await this.mergerService.listCompleteApplications(
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

  getApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const application = await this.mergerService.getCompleteApplication(id);

      if (!application) {
        return reply.status(404).send({ success: false, error: 'Application not found' });
      }

      return reply.send({ success: true, application });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  updateApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const { status, reviewedByUserId } = request.body as any;

      const application = await this.mergerService.updateApplicationStatus(
        id,
        status,
        reviewedByUserId
      );

      return reply.send({ success: true, application });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  submitApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const application = await this.appService.submitApplication(id);

      return reply.send({ success: true, application });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  approveApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const { id: userId } = request.user as any;

      const application = await this.appService.approveApplication(id, userId);
      return reply.send({ success: true, application });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  rejectApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const { reason } = request.body as any;
      const { id: userId } = request.user as any;

      const application = await this.mergerService.rejectApplication(id, reason, userId);
      return reply.send({ success: true, application });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  deleteApplication = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      await this.appService.deleteApplication(id);

      return reply.send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  getByReference = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { referenceNumber } = request.params as any;
      const application = await this.appService.getApplicationByReference(referenceNumber);

      if (!application) {
        return reply.status(404).send({ success: false, error: 'Application not found' });
      }

      return reply.send({ success: true, application });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };
}
