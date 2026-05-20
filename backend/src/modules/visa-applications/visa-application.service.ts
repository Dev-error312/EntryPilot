import { PrismaClient } from '@prisma/client';
import { visaMergerService } from './visa-merger.service';

const prisma = new PrismaClient();

export class VisaApplicationService {
  async createApplication(formId: string, templateId?: string, organizationId?: string) {
    return visaMergerService.mergeFormAndTemplate(formId, templateId, organizationId);
  }

  async get(id: string, organizationId: string) {
    return prisma.completeVisaApplication.findFirst({
      where: { id, organizationId },
      include: { 
        formData: true,
        batchTemplate: true
      }
    });
  }

  async list(organizationId: string, groupId?: string) {
    return prisma.completeVisaApplication.findMany({
      where: {
        organizationId,
        ...(groupId ? { groupId } : {})
      },
      include: { formData: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.completeVisaApplication.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });
  }

  async submitForReview(id: string, userId: string) {
    return prisma.completeVisaApplication.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        reviewedByUserId: userId
      }
    });
  }

  async approve(id: string, userId: string) {
    return prisma.completeVisaApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        reviewedByUserId: userId
      }
    });
  }

  async reject(id: string, reason: string, userId: string) {
    return prisma.completeVisaApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedByUserId: userId
      }
    });
  }
}

export const visaApplicationService = new VisaApplicationService();
