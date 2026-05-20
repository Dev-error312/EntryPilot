import { PrismaClient } from '@prisma/client';

export class BatchTemplateService {
  constructor(private prisma: PrismaClient) {}

  async createTemplate(data: any, organizationId: string, groupId: string, userId: string) {
    return this.prisma.batchPreFillTemplate.create({
      data: {
        ...data,
        organizationId,
        groupId,
        appliedByEmployeeId: userId,
        isActive: true,
      },
    });
  }

  async getTemplate(id: string) {
    return this.prisma.batchPreFillTemplate.findUnique({
      where: { id },
      include: { appliedByEmployee: true },
    });
  }

  async listTemplates(organizationId: string, groupId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { organizationId, isActive: true, ...(groupId && { groupId }) };

    const [templates, total] = await Promise.all([
      this.prisma.batchPreFillTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { appliedByEmployee: true },
      }),
      this.prisma.batchPreFillTemplate.count({ where }),
    ]);

    return { templates, total, pages: Math.ceil(total / limit) };
  }

  async updateTemplate(id: string, data: any) {
    return this.prisma.batchPreFillTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.batchPreFillTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTemplatesByGroup(groupId: string) {
    return this.prisma.batchPreFillTemplate.findMany({
      where: { groupId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
