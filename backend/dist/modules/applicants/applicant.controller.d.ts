import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class ApplicantController {
    private server;
    constructor(server: FastifyInstance);
    /**
     * Helper: Check if passport number already exists in organization
     * Exclude current applicant ID if updating
     */
    private checkDuplicatePassport;
    /**
     * Helper: Check if email already exists in organization
     * Exclude current applicant ID if updating
     */
    private checkDuplicateEmail;
    /**
     * Helper: Handle Prisma errors
     */
    private handlePrismaError;
    /**
     * CREATE: Create new applicant
     */
    create: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    /**
     * LIST: List applicants with filtering and pagination
     */
    list: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    /**
     * LIST GROUPED: List applicants grouped by group with filters and pagination
     */
    listGrouped: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    /**
     * LIST BY GROUP: List applicants in specific group
     */
    listByGroup: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    /**
     * GET BY ID: Get single applicant with full details
     */
    getById: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    /**
     * UPDATE: Update applicant details
     */
    update: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    /**
     * SOFT DELETE: Mark applicant as inactive
     */
    softDelete: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
//# sourceMappingURL=applicant.controller.d.ts.map