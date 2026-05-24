import { FastifyInstance } from 'fastify';
import { DashboardController } from './dashboard.controller';

export async function dashboardRoutes(server: FastifyInstance) {
  const controller = new DashboardController(server);

  server.get('/stats', { 
    preHandler: [server.authenticate, server.tenantGuard] 
  }, controller.getStats);

  server.get('/stats/period', {
    preHandler: [server.authenticate, server.tenantGuard]
  }, async (request, reply) => {
    return controller.getStatsByPeriod(request as any, reply as any);
  });

  server.get('/metrics/processing', {
    preHandler: [server.authenticate, server.tenantGuard]
  }, async (request, reply) => {
    return controller.getProcessingMetrics(request as any, reply as any);
  });

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
