"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRoutes = organizationRoutes;
const organization_controller_1 = require("./organization.controller");
async function organizationRoutes(server) {
    const controller = new organization_controller_1.OrganizationController(server);
    // Super Admin routes
    server.post('/', {
        preHandler: [server.authenticate]
    }, controller.create);
    server.get('/', {
        preHandler: [server.authenticate]
    }, controller.list);
    server.get('/:id/stats', {
        preHandler: [server.authenticate]
    }, controller.getStats);
    server.patch('/:id/toggle', {
        preHandler: [server.authenticate]
    }, controller.toggleActive);
    server.get('/:id', {
        preHandler: [server.authenticate]
    }, controller.getById);
    server.put('/:id', {
        preHandler: [server.authenticate]
    }, controller.update);
    server.delete('/:id', {
        preHandler: [server.authenticate]
    }, controller.delete);
}
//# sourceMappingURL=organization.routes.js.map