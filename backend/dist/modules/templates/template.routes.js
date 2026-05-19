"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRoutes = templateRoutes;
const template_controller_1 = require("./template.controller");
async function templateRoutes(server) {
    const controller = new template_controller_1.TemplateController(server);
    server.post('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.create);
    server.get('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.list);
    server.get('/country/:country', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.listByCountry);
    server.patch('/:id/toggle', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.toggleActive);
    server.get('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getById);
    server.put('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.update);
    server.delete('/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.delete);
}
//# sourceMappingURL=template.routes.js.map