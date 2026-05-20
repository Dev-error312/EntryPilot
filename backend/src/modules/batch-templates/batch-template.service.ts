import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BatchTemplateService {
  async create(data: any, organizationId: string) {
    return prisma.batchPreFillTemplate.create({
      data: {
        ...data,
        organizationId
      }
    });
  }

  async update(id: string, data: any) {
    return prisma.batchPreFillTemplate.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async get(id: string, organizationId: string) {
    return prisma.batchPreFillTemplate.findFirst({
      where: { id, organizationId }
    });
  }

  async list(organizationId: string, groupId?: string) {
    return prisma.batchPreFillTemplate.findMany({
      where: {
        organizationId,
        ...(groupId ? { groupId } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async delete(id: string) {
    return prisma.batchPreFillTemplate.delete({
      where: { id }
    });
  }
}

export const batchTemplateService = new BatchTemplateService();
