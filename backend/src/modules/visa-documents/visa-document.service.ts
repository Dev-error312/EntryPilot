import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VisaDocumentService {
  async create(data: any, organizationId: string) {
    return prisma.visaApplicationDocument.create({
      data: {
        ...data,
        organizationId
      }
    });
  }

  async getDocuments(applicationId: string, organizationId: string) {
    return prisma.visaApplicationDocument.findMany({
      where: {
        organizationId,
        associatedWith: applicationId
      }
    });
  }

  async deleteDocument(id: string) {
    return prisma.visaApplicationDocument.delete({
      where: { id }
    });
  }

  async updateDocumentStatus(id: string, status: string) {
    return prisma.visaApplicationDocument.update({
      where: { id },
      data: { status }
    });
  }
}

export const visaDocumentService = new VisaDocumentService();
