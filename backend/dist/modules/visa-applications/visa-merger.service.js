"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaMergerService = exports.VisaMergerService = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class VisaMergerService {
    async mergeFormAndTemplate(formId, templateId, organizationId) {
        const form = await prisma.visaApplicationForm.findUnique({
            where: { id: formId }
        });
        if (!form)
            throw new Error('Form not found');
        const template = templateId
            ? await prisma.batchPreFillTemplate.findUnique({
                where: { id: templateId }
            })
            : null;
        const referenceNumber = `VA-${Date.now()}-${(0, uuid_1.v4)().slice(0, 8)}`;
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
exports.VisaMergerService = VisaMergerService;
exports.visaMergerService = new VisaMergerService();
//# sourceMappingURL=visa-merger.service.js.map