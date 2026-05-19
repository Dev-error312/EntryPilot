"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const register_service_1 = require("./register.service");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const registerSchema = zod_1.z.object({
    organizationName: zod_1.z.string().min(2).max(100),
    organizationCode: zod_1.z.string().min(2).max(20).regex(/^[A-Z0-9-]+$/),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8), // strength checked in service
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50)
});
class AuthController {
    constructor(server) {
        this.server = server;
        this.register = async (request, reply) => {
            try {
                const body = registerSchema.parse(request.body);
                const result = await this.registerService.registerOrganization(body);
                return reply.status(201).send(result);
            }
            catch (error) {
                if (error.name === 'ZodError') {
                    return reply.status(400).send({ error: 'Validation Error', details: error.errors });
                }
                return reply.status(400).send({ error: 'Registration Failed', message: error.message });
            }
        };
        this.login = async (request, reply) => {
            try {
                const body = loginSchema.parse(request.body);
                const result = await this.service.login(body.email, body.password);
                return reply.send(result);
            }
            catch (error) {
                if (error.name === 'ZodError') {
                    return reply.status(400).send({
                        error: 'Validation Error',
                        details: error.errors
                    });
                }
                return reply.status(401).send({
                    error: 'Authentication Failed',
                    message: error.message
                });
            }
        };
        this.logout = async (request, reply) => {
            try {
                const token = request.headers.authorization?.replace('Bearer ', '');
                if (token) {
                    await this.service.logout(token);
                }
                return reply.send({ message: 'Logged out successfully' });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.refresh = async (request, reply) => {
            try {
                const { refreshToken } = request.body;
                const result = await this.service.refresh(refreshToken);
                return reply.send(result);
            }
            catch (error) {
                return reply.status(401).send({
                    error: 'Refresh Failed',
                    message: error.message
                });
            }
        };
        this.forgotPassword = async (request, reply) => {
            try {
                const { email } = request.body;
                await this.service.forgotPassword(email);
                return reply.send({
                    message: 'If an account exists, a reset link has been sent'
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.resetPassword = async (request, reply) => {
            try {
                const { token, password } = request.body;
                await this.service.resetPassword(token, password);
                return reply.send({ message: 'Password reset successfully' });
            }
            catch (error) {
                return reply.status(400).send({
                    error: 'Reset Failed',
                    message: error.message
                });
            }
        };
        this.me = async (request, reply) => {
            try {
                const user = request.user;
                const profile = await this.service.getProfile(user.id);
                return reply.send(profile);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.service = new auth_service_1.AuthService(server);
        this.registerService = new register_service_1.RegisterService(server);
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map