"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchTemplateRoutes = batchTemplateRoutes;
const batch_template_controller_1 = require("./batch-template.controller");
async function batchTemplateRoutes(app) {
    app.post('/', { onRequest: [app.authenticate] }, (request, reply) => batch_template_controller_1.batchTemplateController.create(request, reply));
    app.get('/', { onRequest: [app.authenticate] }, (request, reply) => batch_template_controller_1.batchTemplateController.list(request, reply));
    app.get('/:id', { onRequest: [app.authenticate] }, (request, reply) => batch_template_controller_1.batchTemplateController.get(request, reply));
    app.patch('/:id', { onRequest: [app.authenticate] }, (request, reply) => batch_template_controller_1.batchTemplateController.update(request, reply));
    app.delete('/:id', { onRequest: [app.authenticate] }, (request, reply) => batch_template_controller_1.batchTemplateController.delete(request, reply));
}
//# sourceMappingURL=batch-template.routes.js.map