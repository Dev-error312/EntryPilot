"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaFormsRoutes = visaFormsRoutes;
const visa_forms_controller_1 = require("./visa-forms.controller");
async function visaFormsRoutes(app) {
    app.post('/', {
        onRequest: [app.authenticate]
    }, (request, reply) => visa_forms_controller_1.visaFormsController.create(request, reply));
    app.get('/', {
        onRequest: [app.authenticate]
    }, (request, reply) => visa_forms_controller_1.visaFormsController.list(request, reply));
    app.get('/:id', {
        onRequest: [app.authenticate]
    }, (request, reply) => visa_forms_controller_1.visaFormsController.get(request, reply));
    app.patch('/:id', {
        onRequest: [app.authenticate]
    }, (request, reply) => visa_forms_controller_1.visaFormsController.update(request, reply));
    app.post('/:id/submit', {
        onRequest: [app.authenticate]
    }, (request, reply) => visa_forms_controller_1.visaFormsController.submit(request, reply));
    app.delete('/:id', {
        onRequest: [app.authenticate]
    }, (request, reply) => visa_forms_controller_1.visaFormsController.delete(request, reply));
}
//# sourceMappingURL=visa-forms.routes.js.map