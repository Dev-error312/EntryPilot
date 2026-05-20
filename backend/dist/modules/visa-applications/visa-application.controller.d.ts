import { FastifyRequest, FastifyReply } from 'fastify';
export declare class VisaApplicationController {
    create(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    get(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
    list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    approve(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    reject(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
export declare const visaApplicationController: VisaApplicationController;
//# sourceMappingURL=visa-application.controller.d.ts.map