import { FastifyRequest, FastifyReply } from 'fastify';
export declare class BatchTemplateController {
    create(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    get(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
    list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    update(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    delete(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
export declare const batchTemplateController: BatchTemplateController;
//# sourceMappingURL=batch-template.controller.d.ts.map