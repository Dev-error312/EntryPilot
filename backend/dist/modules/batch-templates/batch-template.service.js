"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchTemplateService = exports.BatchTemplateService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class BatchTemplateService {
    async create(data, organizationId) {
        return prisma.batchPreFillTemplate.create({
            data: {
                ...data,
                organizationId
            }
        });
    }
    async update(id, data) {
        return prisma.batchPreFillTemplate.update({
            where: { id },
            data: { ...data, updatedAt: new Date() }
        });
    }
    async get(id, organizationId) {
        return prisma.batchPreFillTemplate.findFirst({
            where: { id, organizationId }
        });
    }
    async list(organizationId, groupId) {
        return prisma.batchPreFillTemplate.findMany({
            where: {
                organizationId,
                ...(groupId ? { groupId } : {})
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async delete(id) {
        return prisma.batchPreFillTemplate.delete({
            where: { id }
        });
    }
}
exports.BatchTemplateService = BatchTemplateService;
exports.batchTemplateService = new BatchTemplateService();
//# sourceMappingURL=batch-template.service.js.map