"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaApplicationService = exports.VisaApplicationService = void 0;
const client_1 = require("@prisma/client");
const visa_merger_service_1 = require("./visa-merger.service");
const prisma = new client_1.PrismaClient();
class VisaApplicationService {
    async createApplication(formId, templateId, organizationId) {
        return visa_merger_service_1.visaMergerService.mergeFormAndTemplate(formId, templateId, organizationId);
    }
    async get(id, organizationId) {
        return prisma.completeVisaApplication.findFirst({
            where: { id, organizationId },
            include: {
                formData: true,
                batchTemplate: true
            }
        });
    }
    async list(organizationId, groupId) {
        return prisma.completeVisaApplication.findMany({
            where: {
                organizationId,
                ...(groupId ? { groupId } : {})
            },
            include: { formData: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateStatus(id, status) {
        return prisma.completeVisaApplication.update({
            where: { id },
            data: { status, updatedAt: new Date() }
        });
    }
    async submitForReview(id, userId) {
        return prisma.completeVisaApplication.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                reviewedByUserId: userId
            }
        });
    }
    async approve(id, userId) {
        return prisma.completeVisaApplication.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                reviewedByUserId: userId
            }
        });
    }
    async reject(id, reason, userId) {
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
exports.VisaApplicationService = VisaApplicationService;
exports.visaApplicationService = new VisaApplicationService();
//# sourceMappingURL=visa-application.service.js.map