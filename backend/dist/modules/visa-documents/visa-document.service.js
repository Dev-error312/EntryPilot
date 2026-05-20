"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaDocumentService = exports.VisaDocumentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class VisaDocumentService {
    async create(data, organizationId) {
        return prisma.visaApplicationDocument.create({
            data: {
                ...data,
                organizationId
            }
        });
    }
    async getDocuments(applicationId, organizationId) {
        return prisma.visaApplicationDocument.findMany({
            where: {
                organizationId,
                associatedWith: applicationId
            }
        });
    }
    async deleteDocument(id) {
        return prisma.visaApplicationDocument.delete({
            where: { id }
        });
    }
    async updateDocumentStatus(id, status) {
        return prisma.visaApplicationDocument.update({
            where: { id },
            data: { status }
        });
    }
}
exports.VisaDocumentService = VisaDocumentService;
exports.visaDocumentService = new VisaDocumentService();
//# sourceMappingURL=visa-document.service.js.map