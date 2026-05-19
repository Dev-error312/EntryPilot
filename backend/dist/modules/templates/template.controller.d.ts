import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class TemplateController {
    private server;
    constructor(server: FastifyInstance);
    create: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    list: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    listByCountry: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getById: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    toggleActive: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
//# sourceMappingURL=template.controller.d.ts.map