import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class GroupController {
    private server;
    constructor(server: FastifyInstance);
    create: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    list: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    listActive: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getById: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getByCode: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getGroupApplicants: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    assignEmployee: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    archive: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
//# sourceMappingURL=group.controller.d.ts.map