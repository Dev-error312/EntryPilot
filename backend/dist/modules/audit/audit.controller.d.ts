import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class AuditController {
    private server;
    constructor(server: FastifyInstance);
    list: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    listByEntity: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    listByUser: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
//# sourceMappingURL=audit.controller.d.ts.map