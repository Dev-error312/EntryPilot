"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaFormsController = exports.VisaFormsController = void 0;
const visa_forms_service_1 = require("./visa-forms.service");
class VisaFormsController {
    async create(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const visaForm = await visa_forms_service_1.visaFormsService.createVisaForm(request.body, organizationId);
            reply.code(201).send({
                success: true,
                data: visaForm,
                message: 'Visa form created successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async get(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            const visaForm = await visa_forms_service_1.visaFormsService.getVisaForm(id, organizationId);
            if (!visaForm) {
                return reply.code(404).send({
                    success: false,
                    error: 'Visa form not found'
                });
            }
            reply.send({
                success: true,
                data: visaForm
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async list(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { groupId } = request.query;
            const visaForms = await visa_forms_service_1.visaFormsService.listVisaForms(organizationId, groupId);
            reply.send({
                success: true,
                data: visaForms,
                count: visaForms.length
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async update(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            const visaForm = await visa_forms_service_1.visaFormsService.updateVisaForm(id, request.body, organizationId);
            reply.send({
                success: true,
                data: visaForm,
                message: 'Visa form updated successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async submit(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            const visaForm = await visa_forms_service_1.visaFormsService.submitVisaForm(id, organizationId);
            reply.send({
                success: true,
                data: visaForm,
                message: 'Visa form submitted successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async delete(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            await visa_forms_service_1.visaFormsService.deleteVisaForm(id, organizationId);
            reply.send({
                success: true,
                message: 'Visa form deleted successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
}
exports.VisaFormsController = VisaFormsController;
exports.visaFormsController = new VisaFormsController();
//# sourceMappingURL=visa-forms.controller.js.map