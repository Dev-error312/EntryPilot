import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class DashboardController {
    private server;
    constructor(server: FastifyInstance);
    getStats: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getRecent: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getChartData: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getSuperAdminStats: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map