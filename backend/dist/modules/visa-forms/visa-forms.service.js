"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaFormsService = exports.VisaFormsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class VisaFormsService {
    async createVisaForm(data, organizationId) {
        return prisma.visaApplicationForm.create({
            data: {
                ...data,
                organizationId,
                status: 'DRAFT'
            }
        });
    }
    async updateVisaForm(id, data, organizationId) {
        return prisma.visaApplicationForm.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    async getVisaForm(id, organizationId) {
        return prisma.visaApplicationForm.findFirst({
            where: {
                id,
                organizationId
            }
        });
    }
    async listVisaForms(organizationId, groupId) {
        return prisma.visaApplicationForm.findMany({
            where: {
                organizationId,
                ...(groupId ? { groupId } : {})
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async submitVisaForm(id, organizationId) {
        return prisma.visaApplicationForm.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date()
            }
        });
    }
    async deleteVisaForm(id, organizationId) {
        return prisma.visaApplicationForm.delete({
            where: { id }
        });
    }
}
exports.VisaFormsService = VisaFormsService;
exports.visaFormsService = new VisaFormsService();
//# sourceMappingURL=visa-forms.service.js.map