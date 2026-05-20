import { FastifyRequest, FastifyReply } from 'fastify';
import { visaDocumentService } from './visa-document.service';

export class VisaDocumentController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const doc = await visaDocumentService.create(request.body, user.organizationId);
      reply.code(201).send({ success: true, data: doc });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { applicationId } = request.query as any;
      const docs = await visaDocumentService.getDocuments(applicationId, user.organizationId);
      reply.send({ success: true, data: docs, count: docs.length });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      await visaDocumentService.deleteDocument(id);
      reply.send({ success: true, message: 'Document deleted' });
    } catch (error: any) {
      reply.code(400).send({ success: false, error: error.message });
    }
  }
}

export const visaDocumentController = new VisaDocumentController();
