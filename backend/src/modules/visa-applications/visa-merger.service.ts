import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class VisaMergerService {
  async mergeFormAndTemplate(formId: string, templateId?: string, organizationId?: string) {
    const form = await prisma.visaApplicationForm.findUnique({
      where: { id: formId }
    });

    if (!form) throw new Error('Form not found');

    const template = templateId 
      ? await prisma.batchPreFillTemplate.findUnique({
          where: { id: templateId }
        })
      : null;

    const referenceNumber = `VA-${Date.now()}-${uuidv4().slice(0, 8)}`;

    return prisma.completeVisaApplication.create({
      data: {
        referenceNumber,
        formDataId: formId,
        batchTemplateId: templateId || null,
        applicantFullName: form.fullName,
        applicantEmail: form.residenceEmail,
        applicantPhone: form.residenceMobilePhone,
        inviterFullName: template?.inviterFullName,
        inviterCompany: template?.inviterCompanyName,
        inviterPhone: template?.inviterPhone,
        inviterEmail: template?.inviterEmail,
        purposeOfVisit: template?.purposeOfVisit,
        visaType: template?.visaType,
        intendedArrivalDate: template?.intendedArrivalDate,
        intendedDepartureDate: template?.intendedDepartureDate,
        ticketReceiptIds: template?.ticketReceiptIds,
        hotelBookingIds: template?.hotelBookingIds,
        itineraryIds: template?.itineraryIds,
        invitationLetterIds: template?.invitationLetterIds,
        status: 'DRAFT',
        organizationId: organizationId || form.organizationId,
        groupId: form.groupId,
        applicantId: form.applicantId
      }
    });
  }
}

export const visaMergerService = new VisaMergerService();
