import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VisaDocumentService } from './visa-document.service';

export class VisaDocumentController {
  private service: VisaDocumentService;

  constructor(private server: FastifyInstance) {
    this.service = new VisaDocumentService(this.server.prisma);
  }

  uploadDocument = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId, id: userId } = request.user as any;
      const data = request.body as any;

      const document = await this.service.uploadDocument(data, organizationId, userId);
      return reply.status(201).send({ success: true, document });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  listDocuments = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { organizationId } = request.user as any;
      const { page = 1, limit = 20 } = request.query as any;

      const result = await this.service.listDocuments(
        organizationId,
        parseInt(page),
        parseInt(limit)
      );

      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  getDocument = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const document = await this.service.getDocument(id);

      if (!document) {
        return reply.status(404).send({ success: false, error: 'Document not found' });
      }

      return reply.send({ success: true, document });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  deleteDocument = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      await this.service.deleteDocument(id);

      return reply.send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  getApplicationDocuments = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { applicationId } = request.params as any;
      const documents = await this.service.getApplicationDocuments(applicationId);

      return reply.send({ success: true, documents });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  verifyDocument = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const document = await this.service.verifyDocument(id);

      return reply.send({ success: true, document });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };

  rejectDocument = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const document = await this.service.rejectDocument(id);

      return reply.send({ success: true, document });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  };
}
