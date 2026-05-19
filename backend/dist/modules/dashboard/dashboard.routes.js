"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = dashboardRoutes;
const dashboard_controller_1 = require("./dashboard.controller");
async function dashboardRoutes(server) {
    const controller = new dashboard_controller_1.DashboardController(server);
    server.get('/stats', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getStats);
    server.get('/recent', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getRecent);
    server.get('/chart', {
        preHandler: [server.authenticate, server.tenantGuard]
    }, controller.getChartData);
    server.get('/super-admin', {
        preHandler: [server.authenticate]
    }, controller.getSuperAdminStats);
}
//# sourceMappingURL=dashboard.routes.js.map