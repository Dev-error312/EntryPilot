"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaDocumentController = exports.VisaDocumentController = void 0;
const visa_document_service_1 = require("./visa-document.service");
class VisaDocumentController {
    async create(request, reply) {
        try {
            const user = request.user;
            const doc = await visa_document_service_1.visaDocumentService.create(request.body, user.organizationId);
            reply.code(201).send({ success: true, data: doc });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async list(request, reply) {
        try {
            const user = request.user;
            const { applicationId } = request.query;
            const docs = await visa_document_service_1.visaDocumentService.getDocuments(applicationId, user.organizationId);
            reply.send({ success: true, data: docs, count: docs.length });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async delete(request, reply) {
        try {
            const { id } = request.params;
            await visa_document_service_1.visaDocumentService.deleteDocument(id);
            reply.send({ success: true, message: 'Document deleted' });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
}
exports.VisaDocumentController = VisaDocumentController;
exports.visaDocumentController = new VisaDocumentController();
//# sourceMappingURL=visa-document.controller.js.map