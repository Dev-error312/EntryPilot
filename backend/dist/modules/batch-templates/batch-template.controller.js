"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchTemplateController = exports.BatchTemplateController = void 0;
const batch_template_service_1 = require("./batch-template.service");
class BatchTemplateController {
    async create(request, reply) {
        try {
            const user = request.user;
            const template = await batch_template_service_1.batchTemplateService.create(request.body, user.organizationId);
            reply.code(201).send({ success: true, data: template });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async get(request, reply) {
        try {
            const user = request.user;
            const { id } = request.params;
            const template = await batch_template_service_1.batchTemplateService.get(id, user.organizationId);
            if (!template)
                return reply.code(404).send({ success: false, error: 'Template not found' });
            reply.send({ success: true, data: template });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async list(request, reply) {
        try {
            const user = request.user;
            const { groupId } = request.query;
            const templates = await batch_template_service_1.batchTemplateService.list(user.organizationId, groupId);
            reply.send({ success: true, data: templates, count: templates.length });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async update(request, reply) {
        try {
            const { id } = request.params;
            const template = await batch_template_service_1.batchTemplateService.update(id, request.body);
            reply.send({ success: true, data: template });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async delete(request, reply) {
        try {
            const { id } = request.params;
            await batch_template_service_1.batchTemplateService.delete(id);
            reply.send({ success: true, message: 'Template deleted' });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
}
exports.BatchTemplateController = BatchTemplateController;
exports.batchTemplateController = new BatchTemplateController();
//# sourceMappingURL=batch-template.controller.js.map