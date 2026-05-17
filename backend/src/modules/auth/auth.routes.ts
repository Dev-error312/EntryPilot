import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';

export async function authRoutes(server: FastifyInstance) {
  const controller = new AuthController(server);
  // Public endpoints
  server.post('/register', controller.register);
  server.post('/login', controller.login);
  server.post('/logout', { preHandler: [server.authenticate] }, controller.logout);
  server.post('/refresh', controller.refresh);
  server.post('/forgot-password', controller.forgotPassword);
  server.post('/reset-password', controller.resetPassword);
  server.get('/me', { preHandler: [server.authenticate] }, controller.me);
}
