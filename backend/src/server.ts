import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './modules/auth/auth.routes';
import { organizationRoutes } from './modules/organizations/organization.routes';
import { userRoutes } from './modules/users/user.routes';
import { groupRoutes } from './modules/groups/group.routes';
import { applicantRoutes } from './modules/applicants/applicant.routes';
import { applicationRoutes } from './modules/applications/application.routes';
import { templateRoutes } from './modules/templates/template.routes';
import { importRoutes } from './modules/imports/import.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { templateRoutes as importTemplateRoutes } from './modules/imports/template.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';

export const prisma = new PrismaClient();

const server = Fastify({
  logger: true
});

async function bootstrap() {
  // Register plugins
  await server.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  });

  await server.register(jwt, {
    secret: process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET environment variable is required');
    })()
  });

  await server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  });

  // Decorate server with prisma
  server.decorate('prisma', prisma);

  // Auth middleware decorator
  server.decorate('authenticate', authMiddleware);
  server.decorate('tenantGuard', tenantMiddleware);

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(organizationRoutes, { prefix: '/api/organizations' });
  await server.register(userRoutes, { prefix: '/api/users' });
  await server.register(groupRoutes, { prefix: '/api/groups' });
  await server.register(applicantRoutes, { prefix: '/api/applicants' });
  await server.register(applicationRoutes, { prefix: '/api/applications' });
  await server.register(templateRoutes, { prefix: '/api/templates' });
  await server.register(importRoutes, { prefix: '/api/imports' });
  await server.register(importTemplateRoutes, { prefix: '/api/imports/templates' });
  await server.register(auditRoutes, { prefix: '/api/audit' });
  await server.register(dashboardRoutes, { prefix: '/api/dashboard' });

  // Start server
  try {
    const port = parseInt(process.env.PORT || '4000', 10);
    const address = await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 EntryPilot API running at ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();

// Type declarations
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: any;
    tenantGuard: any;
  }
}
