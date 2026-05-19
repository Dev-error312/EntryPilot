"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationRoutes = applicationRoutes;
const application_controller_1 = require("./application.controller");
async function applicationRoutes(server) {
    const controller = new application_controller_1.ApplicationController(server);
    server.post('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.create);
    server.get('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.list);
    server.get('/status/:status', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.listByStatus);
    server.get('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getById);
    server.put('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.update);
    server.post('/:id/submit', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.submit);
    server.post('/:id/approve', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.approve);
    server.post('/:id/reject', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.reject);
    server.post('/:id/deliver', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.deliver);
}
//# sourceMappingURL=application.routes.js.map