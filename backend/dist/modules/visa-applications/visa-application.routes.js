"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaApplicationRoutes = visaApplicationRoutes;
const visa_application_controller_1 = require("./visa-application.controller");
async function visaApplicationRoutes(app) {
    app.post('/', { onRequest: [app.authenticate] }, (request, reply) => visa_application_controller_1.visaApplicationController.create(request, reply));
    app.get('/', { onRequest: [app.authenticate] }, (request, reply) => visa_application_controller_1.visaApplicationController.list(request, reply));
    app.get('/:id', { onRequest: [app.authenticate] }, (request, reply) => visa_application_controller_1.visaApplicationController.get(request, reply));
    app.post('/:id/approve', { onRequest: [app.authenticate] }, (request, reply) => visa_application_controller_1.visaApplicationController.approve(request, reply));
    app.post('/:id/reject', { onRequest: [app.authenticate] }, (request, reply) => visa_application_controller_1.visaApplicationController.reject(request, reply));
}
//# sourceMappingURL=visa-application.routes.js.map