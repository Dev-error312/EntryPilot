"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaDocumentRoutes = visaDocumentRoutes;
const visa_document_controller_1 = require("./visa-document.controller");
async function visaDocumentRoutes(app) {
    app.post('/', { onRequest: [app.authenticate] }, (request, reply) => visa_document_controller_1.visaDocumentController.create(request, reply));
    app.get('/', { onRequest: [app.authenticate] }, (request, reply) => visa_document_controller_1.visaDocumentController.list(request, reply));
    app.delete('/:id', { onRequest: [app.authenticate] }, (request, reply) => visa_document_controller_1.visaDocumentController.delete(request, reply));
}
//# sourceMappingURL=visa-document.routes.js.map