"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaApplicationController = exports.VisaApplicationController = void 0;
const visa_application_service_1 = require("./visa-application.service");
class VisaApplicationController {
    async create(request, reply) {
        try {
            const user = request.user;
            const { formId, templateId } = request.body;
            const app = await visa_application_service_1.visaApplicationService.createApplication(formId, templateId, user.organizationId);
            reply.code(201).send({ success: true, data: app });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async get(request, reply) {
        try {
            const user = request.user;
            const { id } = request.params;
            const app = await visa_application_service_1.visaApplicationService.get(id, user.organizationId);
            if (!app)
                return reply.code(404).send({ success: false, error: 'Application not found' });
            reply.send({ success: true, data: app });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async list(request, reply) {
        try {
            const user = request.user;
            const { groupId } = request.query;
            const apps = await visa_application_service_1.visaApplicationService.list(user.organizationId, groupId);
            reply.send({ success: true, data: apps, count: apps.length });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async approve(request, reply) {
        try {
            const user = request.user;
            const { id } = request.params;
            const app = await visa_application_service_1.visaApplicationService.approve(id, user.id);
            reply.send({ success: true, data: app });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async reject(request, reply) {
        try {
            const user = request.user;
            const { id } = request.params;
            const { reason } = request.body;
            const app = await visa_application_service_1.visaApplicationService.reject(id, reason, user.id);
            reply.send({ success: true, data: app });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
}
exports.VisaApplicationController = VisaApplicationController;
exports.visaApplicationController = new VisaApplicationController();
//# sourceMappingURL=visa-application.controller.js.map