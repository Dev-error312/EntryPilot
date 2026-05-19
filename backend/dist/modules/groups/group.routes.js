"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupRoutes = groupRoutes;
const group_controller_1 = require("./group.controller");
async function groupRoutes(server) {
    const controller = new group_controller_1.GroupController(server);
    server.post('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.create);
    server.get('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.list);
    server.get('/active', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.listActive);
    server.get('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getById);
    server.put('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.update);
    server.post('/:id/assign', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.assignEmployee);
    server.patch('/:id/archive', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.archive);
    server.delete('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.delete);
}
//# sourceMappingURL=group.routes.js.map