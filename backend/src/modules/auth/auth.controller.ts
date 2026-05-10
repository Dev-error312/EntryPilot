import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export class AuthController {
  private service: AuthService;

  constructor(private server: FastifyInstance) {
    this.service = new AuthService(server);
  }

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = loginSchema.parse(request.body);
      const result = await this.service.login(body.email, body.password);
      
      return reply.send(result);
    } catch (error: any) {
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

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await this.service.logout(token);
      }
      return reply.send({ message: 'Logged out successfully' });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as any;
      const result = await this.service.refresh(refreshToken);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(401).send({ 
        error: 'Refresh Failed', 
        message: error.message 
      });
    }
  };

  forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email } = request.body as any;
      await this.service.forgotPassword(email);
      return reply.send({ 
        message: 'If an account exists, a reset link has been sent' 
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token, password } = request.body as any;
      await this.service.resetPassword(token, password);
      return reply.send({ message: 'Password reset successfully' });
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Reset Failed', 
        message: error.message 
      });
    }
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const profile = await this.service.getProfile(user.id);
      return reply.send(profile);
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };
}
