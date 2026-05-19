"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_1 = require("./auth.controller");
async function authRoutes(server) {
    const controller = new auth_controller_1.AuthController(server);
    // Public endpoints
    server.post('/register', controller.register);
    server.post('/login', controller.login);
    server.post('/logout', { preHandler: [server.authenticate] }, controller.logout);
    server.post('/refresh', controller.refresh);
    server.post('/forgot-password', controller.forgotPassword);
    server.post('/reset-password', controller.resetPassword);
    server.get('/me', { preHandler: [server.authenticate] }, controller.me);
}
//# sourceMappingURL=auth.routes.js.map