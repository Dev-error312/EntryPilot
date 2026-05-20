import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VisaFormsService {
  async createVisaForm(data: any, organizationId: string) {
    return prisma.visaApplicationForm.create({
      data: {
        ...data,
        organizationId,
        status: data.status || 'READY'
      }
    });
  }

  async updateVisaForm(id: string, data: any, organizationId: string) {
    return prisma.visaApplicationForm.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async getVisaForm(id: string, organizationId: string) {
    return prisma.visaApplicationForm.findFirst({
      where: {
        id,
        organizationId
      }
    });
  }

  async listVisaForms(organizationId: string, groupId?: string) {
    return prisma.visaApplicationForm.findMany({
      where: {
        organizationId,
        ...(groupId ? { groupId } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async submitVisaForm(id: string, organizationId: string) {
    return prisma.visaApplicationForm.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });
  }

  async deleteVisaForm(id: string, organizationId: string) {
    return prisma.visaApplicationForm.delete({
      where: { id }
    });
  }
}

export const visaFormsService = new VisaFormsService();
