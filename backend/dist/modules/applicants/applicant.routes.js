"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicantRoutes = applicantRoutes;
const applicant_controller_1 = require("./applicant.controller");
async function applicantRoutes(server) {
    const controller = new applicant_controller_1.ApplicantController(server);
    server.post('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.create);
    server.get('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.list);
    server.get('/grouped', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.listGrouped);
    server.get('/group/:groupId', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.listByGroup);
    server.get('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getById);
    server.put('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.update);
    server.delete('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.softDelete);
}
//# sourceMappingURL=applicant.routes.js.map