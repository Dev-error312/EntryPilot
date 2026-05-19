"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRoutes = auditRoutes;
const audit_controller_1 = require("./audit.controller");
async function auditRoutes(server) {
    const controller = new audit_controller_1.AuditController(server);
    server.get('/', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.list);
    server.get('/entity/:type/:id', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.listByEntity);
    server.get('/user/:userId', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.listByUser);
}
//# sourceMappingURL=audit.routes.js.map