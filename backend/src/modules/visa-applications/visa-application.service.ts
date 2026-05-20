import { PrismaClient } from '@prisma/client';

export class VisaApplicationService {
  constructor(private prisma: PrismaClient) {}

  async submitApplication(id: string) {
    return this.prisma.completeVisaApplication.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  }

  async approveApplication(id: string, userId: string) {
    return this.prisma.completeVisaApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        reviewedAt: new Date(),
        reviewedByUserId: userId,
      },
    });
  }

  async deleteApplication(id: string) {
    return this.prisma.completeVisaApplication.delete({
      where: { id },
    });
  }

  async getApplicationByReference(referenceNumber: string) {
    return this.prisma.completeVisaApplication.findUnique({
      where: { referenceNumber },
      include: {
        formData: true,
        batchTemplate: true,
        applicant: true,
      },
    });
  }

  async getApplicationsByApplicant(applicantId: string) {
    return this.prisma.completeVisaApplication.findMany({
      where: { applicantId },
      orderBy: { createdAt: 'desc' },
      include: { formData: true, batchTemplate: true },
    });
  }
}
