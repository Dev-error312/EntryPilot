import { PrismaClient } from '@prisma/client';

export class VisaDocumentService {
  constructor(private prisma: PrismaClient) {}

  async uploadDocument(data: any, organizationId: string, userId: string) {
    return this.prisma.visaApplicationDocument.create({
      data: {
        ...data,
        organizationId,
        uploadedBy: userId,
        status: 'PENDING',
      },
    });
  }

  async getDocument(id: string) {
    return this.prisma.visaApplicationDocument.findUnique({
      where: { id },
      include: { uploadedByUser: true },
    });
  }

  async listDocuments(organizationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { organizationId };

    const [documents, total] = await Promise.all([
      this.prisma.visaApplicationDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploadedByUser: true },
      }),
      this.prisma.visaApplicationDocument.count({ where }),
    ]);

    return { documents, total, pages: Math.ceil(total / limit) };
  }

  async getApplicationDocuments(applicationId: string) {
    return this.prisma.visaApplicationDocument.findMany({
      where: { associatedWith: applicationId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedByUser: true },
    });
  }

  async deleteDocument(id: string) {
    return this.prisma.visaApplicationDocument.delete({
      where: { id },
    });
  }

  async verifyDocument(id: string) {
    return this.prisma.visaApplicationDocument.update({
      where: { id },
      data: { status: 'VERIFIED' },
    });
  }

  async rejectDocument(id: string) {
    return this.prisma.visaApplicationDocument.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }
}
