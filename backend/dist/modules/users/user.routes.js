"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const user_controller_1 = require("./user.controller");
async function userRoutes(server) {
    const controller = new user_controller_1.UserController(server);
    server.post('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.create);
    server.get('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.list);
    server.get('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getById);
    server.put('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.update);
    server.patch('/:id/toggle', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.toggleActive);
    server.delete('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.delete);
}
//# sourceMappingURL=user.routes.js.map