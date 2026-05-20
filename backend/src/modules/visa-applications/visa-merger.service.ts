import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export class VisaMergerService {
  constructor(private prisma: PrismaClient) {}

  generateReferenceNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `VISA-${timestamp}-${random}`;
  }

  async createCompleteApplication(formDataId: string, batchTemplateId?: string, groupId?: string) {
    const formData = await this.prisma.visaApplicationForm.findUnique({
      where: { id: formDataId },
    });

    if (!formData) {
      throw new Error('Form data not found');
    }

    let batchData = null;
    if (batchTemplateId) {
      batchData = await this.prisma.batchPreFillTemplate.findUnique({
        where: { id: batchTemplateId },
      });
    }

    const referenceNumber = this.generateReferenceNumber();

    const completeApp = await this.prisma.completeVisaApplication.create({
      data: {
        referenceNumber,
        formDataId,
        batchTemplateId: batchTemplateId || null,
        applicantFullName: formData.fullName,
        applicantEmail: formData.residenceEmail,
        applicantPhone: formData.residenceMobilePhone,
        applicantDOB: null,
        inviterFullName: batchData?.inviterFullName || null,
        inviterCompany: batchData?.inviterCompanyName || null,
        inviterPhone: batchData?.inviterPhone || null,
        inviterEmail: batchData?.inviterEmail || null,
        purposeOfVisit: batchData?.purposeOfVisit || null,
        visaType: batchData?.visaType || null,
        intendedArrivalDate: batchData?.intendedArrivalDate || null,
        intendedDepartureDate: batchData?.intendedDepartureDate || null,
        ticketReceiptIds: batchData?.ticketReceiptIds || null,
        hotelBookingIds: batchData?.hotelBookingIds || null,
        itineraryIds: batchData?.itineraryIds || null,
        invitationLetterIds: batchData?.invitationLetterIds || null,
        status: 'DRAFT',
        organizationId: formData.organizationId,
        groupId: formData.groupId,
        applicantId: formData.applicantId || null,
      },
    });

    return completeApp;
  }

  async getCompleteApplication(id: string) {
    return this.prisma.completeVisaApplication.findUnique({
      where: { id },
      include: {
        formData: true,
        batchTemplate: true,
        applicant: true,
        reviewedByUser: true,
      },
    });
  }

  async listCompleteApplications(
    organizationId: string,
    groupId?: string,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;
    const where = { organizationId, ...(groupId && { groupId }) };

    const [applications, total] = await Promise.all([
      this.prisma.completeVisaApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { formData: true, batchTemplate: true },
      }),
      this.prisma.completeVisaApplication.count({ where }),
    ]);

    return { applications, total, pages: Math.ceil(total / limit) };
  }

  async updateApplicationStatus(id: string, status: string, userId?: string) {
    const updates: any = { status };

    if (status === 'UNDER_REVIEW' || status === 'SUBMITTED') {
      updates.submittedAt = new Date();
    }

    if (status === 'APPROVED' || status === 'REJECTED') {
      updates.reviewedAt = new Date();
      updates.reviewedByUserId = userId;

      if (status === 'APPROVED') {
        updates.approvedAt = new Date();
      }
    }

    return this.prisma.completeVisaApplication.update({
      where: { id },
      data: updates,
    });
  }

  async rejectApplication(id: string, reason: string, userId: string) {
    return this.prisma.completeVisaApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedByUserId: userId,
      },
    });
  }

  async getApplicationsByStatus(organizationId: string, status: string) {
    return this.prisma.completeVisaApplication.findMany({
      where: { organizationId, status },
      orderBy: { createdAt: 'desc' },
      include: { formData: true, applicant: true },
    });
  }
}
