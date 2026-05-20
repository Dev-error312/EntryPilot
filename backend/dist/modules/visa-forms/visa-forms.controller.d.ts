import { FastifyRequest, FastifyReply } from 'fastify';
export declare class VisaFormsController {
    create(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    get(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
    list(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    update(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    submit(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    delete(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
export declare const visaFormsController: VisaFormsController;
//# sourceMappingURL=visa-forms.controller.d.ts.map