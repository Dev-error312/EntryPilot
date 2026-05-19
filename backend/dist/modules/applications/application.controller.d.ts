import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class ApplicationController {
    private server;
    constructor(server: FastifyInstance);
    private generateReferenceNumber;
    create: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    list: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    listByStatus: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getById: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    private updateStatus;
    submit: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    approve: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    reject: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    deliver: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
//# sourceMappingURL=application.controller.d.ts.map