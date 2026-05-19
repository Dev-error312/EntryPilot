import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
export declare class ImportController {
    private server;
    private draftService;
    constructor(server: FastifyInstance);
    private initDraftService;
    initOCR(): Promise<void>;
    ensureUploadsDir(): Promise<void>;
    upload: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    list: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getById: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getApplicants: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    process: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getResults: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getFields: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    private processCSV;
    private parseCSVLine;
    private processExcel;
    private processPDF;
    private processImage;
    private createApplicantsFromImport;
    getDrafts: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getDraft: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    updateDraft: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    approveDraft: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    approveAll: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    rejectDraft: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    getStats: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
//# sourceMappingURL=import.controller.d.ts.map