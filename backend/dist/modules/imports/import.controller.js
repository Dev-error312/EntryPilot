"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const XLSX = __importStar(require("xlsx"));
const china_visa_parser_1 = require("./china-visa-parser");
const china_visa_fields_1 = require("./china-visa-fields");
const applicant_draft_service_1 = require("./applicant-draft.service");
// Ensure uploads directory exists
const UPLOADS_DIR = path_1.default.join(process.cwd(), 'uploads');
class ImportController {
    constructor(server) {
        this.server = server;
        this.draftService = null;
        this.upload = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                await this.ensureUploadsDir();
                const data = await request.file();
                if (!data) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'No file uploaded'
                    });
                }
                const allowedTypes = [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-excel',
                    'text/csv',
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                ];
                if (!allowedTypes.includes(data.mimetype)) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Invalid file type. Supported: Excel (.xlsx, .xls), CSV, PDF, Images (JPG, PNG)'
                    });
                }
                const fileId = (0, uuid_1.v4)();
                const ext = path_1.default.extname(data.filename);
                const fileName = `${fileId}${ext}`;
                const filePath = path_1.default.join(UPLOADS_DIR, fileName);
                // Save file
                const buffer = await data.toBuffer();
                await promises_1.default.writeFile(filePath, buffer);
                // Get groupId from fields
                const fields = data.fields;
                const groupId = fields.groupId?.value;
                // Create import record
                const importRecord = await this.server.prisma.import.create({
                    data: {
                        fileName: data.filename,
                        fileType: data.mimetype,
                        fileSize: buffer.length,
                        filePath: fileName,
                        status: 'PENDING',
                        organizationId: orgId,
                        groupId: groupId
                    }
                });
                return reply.status(201).send({
                    id: importRecord.id,
                    fileName: importRecord.fileName,
                    fileType: importRecord.fileType,
                    fileSize: importRecord.fileSize,
                    status: importRecord.status,
                    message: 'File uploaded successfully. Click Process to extract data.'
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.list = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { page = 1, limit = 20, status } = request.query;
                const where = { organizationId: orgId };
                if (status)
                    where.status = status;
                const [imports, total] = await Promise.all([
                    this.server.prisma.import.findMany({
                        where,
                        skip: (page - 1) * limit,
                        take: parseInt(limit),
                        orderBy: { createdAt: 'desc' }
                    }),
                    this.server.prisma.import.count({ where })
                ]);
                return reply.send({
                    data: imports,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getById = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { id } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                return reply.send(importRecord);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        // DELETE import and associated applicants
        this.delete = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                // Delete associated applicants that were created from this import
                // We identify them by checking their documents.importId
                await this.server.prisma.$transaction(async (tx) => {
                    // Find applicants created from this import
                    const applicantsToDelete = await tx.applicant.findMany({
                        where: {
                            organizationId: orgId,
                            groupId: importRecord.groupId || undefined,
                            documents: {
                                path: ['importId'],
                                equals: id
                            }
                        }
                    });
                    // Delete applications for these applicants
                    if (applicantsToDelete.length > 0) {
                        const applicantIds = applicantsToDelete.map(a => a.id);
                        await tx.application.deleteMany({
                            where: {
                                applicantId: { in: applicantIds },
                                organizationId: orgId
                            }
                        });
                        await tx.applicant.deleteMany({
                            where: {
                                id: { in: applicantIds },
                                organizationId: orgId
                            }
                        });
                    }
                    // Delete the import file
                    try {
                        const filePath = path_1.default.join(UPLOADS_DIR, importRecord.filePath);
                        await promises_1.default.unlink(filePath);
                    }
                    catch (e) {
                        console.log('File already deleted or not found');
                    }
                    // Delete the import record
                    await tx.import.delete({
                        where: { id }
                    });
                    // Audit log
                    await tx.auditLog.create({
                        data: {
                            action: 'DELETE_IMPORT',
                            entityType: 'Import',
                            entityId: id,
                            oldValues: {
                                fileName: importRecord.fileName,
                                processedCount: importRecord.processedCount
                            },
                            userId: user.id,
                            organizationId: orgId
                        }
                    });
                });
                return reply.send({
                    message: 'Import and associated applicants deleted successfully'
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        // GET applicants from an import
        this.getApplicants = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { id } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                // Get applicants created from this import
                const applicants = await this.server.prisma.applicant.findMany({
                    where: {
                        organizationId: orgId,
                        documents: {
                            path: ['importId'],
                            equals: id
                        }
                    },
                    include: {
                        group: {
                            select: {
                                id: true,
                                code: true,
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                });
                // Also get the metadata with parsed data (for uncreated applicants)
                const metadata = importRecord.metadata;
                const parsedApplicants = metadata?.applicants || [];
                return reply.send({
                    import: importRecord,
                    applicants,
                    parsedApplicants
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.process = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                if (importRecord.status !== 'PENDING') {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Import already processed or in progress'
                    });
                }
                // Update status to processing
                await this.server.prisma.import.update({
                    where: { id },
                    data: { status: 'PROCESSING' }
                });
                // Process file based on type
                const filePath = path_1.default.join(UPLOADS_DIR, importRecord.filePath);
                let parseResult;
                try {
                    if (importRecord.fileType === 'text/csv') {
                        parseResult = await this.processCSV(filePath);
                    }
                    else if (importRecord.fileType.includes('spreadsheet') || importRecord.fileType.includes('excel')) {
                        parseResult = await this.processExcel(filePath);
                    }
                    else if (importRecord.fileType === 'application/pdf') {
                        parseResult = await this.processPDF(filePath);
                    }
                    else if (importRecord.fileType.startsWith('image/')) {
                        parseResult = await this.processImage(filePath);
                    }
                    else {
                        throw new Error('Unsupported file type');
                    }
                    // Create applicants if groupId provided and we have valid data
                    if (importRecord.groupId && parseResult.applicants.length > 0) {
                        const validApplicants = parseResult.applicants.filter(a => a.missingRequired.length === 0);
                        const createdCount = await this.createApplicantsFromImport(validApplicants, importRecord.groupId, orgId, user.id, id);
                        parseResult.successCount = createdCount;
                    }
                    // Update import record with results
                    await this.server.prisma.import.update({
                        where: { id },
                        data: {
                            status: parseResult.errorCount > 0 && parseResult.successCount > 0
                                ? 'PARTIAL'
                                : parseResult.successCount > 0
                                    ? 'COMPLETED'
                                    : 'FAILED',
                            totalCount: parseResult.totalProcessed,
                            processedCount: parseResult.successCount,
                            errorCount: parseResult.errorCount,
                            errors: parseResult.warnings.length > 0 ? { warnings: parseResult.warnings } : undefined,
                            metadata: parseResult.applicants.length > 0 ? {
                                applicants: parseResult.applicants,
                                parsedAt: new Date().toISOString()
                            } : undefined
                        }
                    });
                    return reply.send({
                        message: parseResult.successCount > 0
                            ? `Successfully processed ${parseResult.successCount} applicant(s)`
                            : 'Processing completed with errors',
                        ...parseResult,
                        applicants: parseResult.applicants.map(a => ({
                            ...a,
                            validation: (0, china_visa_parser_1.validateApplicantData)(a.data)
                        }))
                    });
                }
                catch (processError) {
                    await this.server.prisma.import.update({
                        where: { id },
                        data: {
                            status: 'FAILED',
                            errors: { message: processError.message }
                        }
                    });
                    return reply.status(500).send({
                        error: 'Processing Error',
                        message: processError.message
                    });
                }
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getResults = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { id } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                return reply.send({
                    id: importRecord.id,
                    status: importRecord.status,
                    totalCount: importRecord.totalCount,
                    processedCount: importRecord.processedCount,
                    errorCount: importRecord.errorCount,
                    errors: importRecord.errors,
                    data: importRecord.metadata
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getFields = async (request, reply) => {
            return reply.send({
                fields: china_visa_fields_1.CHINA_VISA_FIELDS,
                sections: [
                    { id: 'personal', name: 'Personal Information' },
                    { id: 'passport', name: 'Passport Information' },
                    { id: 'occupation', name: 'Occupation' },
                    { id: 'contact', name: 'Contact Information' },
                    { id: 'emergency', name: 'Emergency Contact' },
                    { id: 'visa', name: 'Visa Information' },
                    { id: 'travel', name: 'Travel Details' },
                    { id: 'inviter', name: 'Inviting Party' },
                    { id: 'history', name: 'Travel History' },
                    { id: 'other', name: 'Other Information' },
                ]
            });
        };
        // ==================== DRAFT MANAGEMENT ====================
        this.getDrafts = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { id } = request.params;
                const { status, minConfidence, page = 1, limit = 20 } = request.query;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                const draftService = this.initDraftService();
                const { drafts, total } = await draftService.getDrafts(id, orgId, {
                    status: status,
                    minConfidence: minConfidence ? parseInt(minConfidence) : undefined,
                    page: parseInt(page),
                    limit: parseInt(limit)
                });
                const stats = await draftService.getReviewStats(id, orgId);
                return reply.send({
                    drafts,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total
                    },
                    stats
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getDraft = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { id, draftId } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                const draftService = this.initDraftService();
                const draft = await draftService.getDraft(draftId, orgId);
                if (!draft) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Draft not found'
                    });
                }
                const duplicates = await draftService.checkDuplicates(draftId, orgId);
                return reply.send({
                    ...draft,
                    duplicates: duplicates.duplicates
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.updateDraft = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id, draftId } = request.params;
                const corrections = request.body;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                const draftService = this.initDraftService();
                const draft = await draftService.updateDraft(draftId, orgId, corrections, user.id);
                return reply.send(draft);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.approveDraft = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id, draftId } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                if (!importRecord.groupId) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Import has no associated group'
                    });
                }
                const draftService = this.initDraftService();
                const result = await draftService.approveDraft(draftId, orgId, importRecord.groupId, user.id);
                return reply.send(result);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.approveAll = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                if (!importRecord.groupId) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Import has no associated group'
                    });
                }
                const draftService = this.initDraftService();
                const result = await draftService.approveAll(id, orgId, importRecord.groupId, user.id);
                return reply.send(result);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.rejectDraft = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id, draftId } = request.params;
                const { reason } = request.body;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                const draftService = this.initDraftService();
                const draft = await draftService.rejectDraft(draftId, orgId, user.id, reason);
                return reply.send(draft);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getStats = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { id } = request.params;
                const importRecord = await this.server.prisma.import.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!importRecord) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Import not found'
                    });
                }
                const draftService = this.initDraftService();
                const stats = await draftService.getReviewStats(id, orgId);
                return reply.send(stats);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
    }
    initDraftService() {
        if (!this.draftService) {
            this.draftService = new applicant_draft_service_1.ApplicantDraftService(this.server);
        }
        return this.draftService;
    }
    async initOCR() {
        try {
            console.log('OCR initialization called');
            // TODO: Implement OCR worker pool initialization if needed
        }
        catch (error) {
            console.error('Failed to initialize OCR:', error);
        }
    }
    async ensureUploadsDir() {
        try {
            await promises_1.default.access(UPLOADS_DIR);
        }
        catch {
            await promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
        }
    }
    // ==================== FILE PROCESSORS ====================
    async processCSV(filePath) {
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) {
            return {
                applicants: [],
                totalProcessed: 0,
                successCount: 0,
                errorCount: 0,
                warnings: ['CSV file is empty or has no data rows'],
            };
        }
        const rows = lines.map(line => this.parseCSVLine(line));
        return (0, china_visa_parser_1.parseExcelData)(rows);
    }
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    async processExcel(filePath) {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (rows.length < 2) {
                return {
                    applicants: [],
                    totalProcessed: 0,
                    successCount: 0,
                    errorCount: 0,
                    warnings: ['Excel file is empty or has no data rows'],
                };
            }
            return (0, china_visa_parser_1.parseExcelData)(rows);
        }
        catch (error) {
            return {
                applicants: [],
                totalProcessed: 0,
                successCount: 0,
                errorCount: 1,
                warnings: [`Excel parsing error: ${error.message}`],
            };
        }
    }
    async processPDF(filePath) {
        try {
            const pdfParse = require('pdf-parse');
            const buffer = await promises_1.default.readFile(filePath);
            const data = await pdfParse(buffer);
            return (0, china_visa_parser_1.parsePDFText)(data.text);
        }
        catch (error) {
            return {
                applicants: [],
                totalProcessed: 0,
                successCount: 0,
                errorCount: 1,
                warnings: [`PDF parsing error: ${error.message}`],
            };
        }
    }
    async processImage(filePath) {
        try {
            const { createWorker } = require('tesseract.js');
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(filePath);
            await worker.terminate();
            return (0, china_visa_parser_1.parseOCRText)(text);
        }
        catch (error) {
            return {
                applicants: [],
                totalProcessed: 0,
                successCount: 0,
                errorCount: 1,
                warnings: [`OCR error: ${error.message}`],
            };
        }
    }
    // ==================== CREATE APPLICANTS ====================
    async createApplicantsFromImport(parsedApplicants, groupId, orgId, userId, importId) {
        let createdCount = 0;
        for (const parsed of parsedApplicants) {
            try {
                const applicantData = (0, china_visa_parser_1.transformToApplicant)(parsed.data, groupId);
                if (!applicantData.firstName && !applicantData.lastName) {
                    continue;
                }
                await this.server.prisma.$transaction(async (tx) => {
                    const applicant = await tx.applicant.create({
                        data: {
                            firstName: applicantData.firstName || 'Unknown',
                            lastName: applicantData.lastName || 'Unknown',
                            email: applicantData.email,
                            phone: applicantData.phone,
                            dob: applicantData.dob ? new Date(applicantData.dob) : null,
                            gender: applicantData.gender,
                            nationality: applicantData.nationality,
                            passportNumber: applicantData.passportNumber,
                            passportIssue: applicantData.passportIssue ? new Date(applicantData.passportIssue) : null,
                            passportExpiry: applicantData.passportExpiry ? new Date(applicantData.passportExpiry) : null,
                            address: applicantData.address,
                            groupId,
                            organizationId: orgId,
                            documents: {
                                ...applicantData.documents,
                                importId,
                                source: parsed.source,
                                confidence: parsed.confidence
                            },
                        }
                    });
                    await tx.auditLog.create({
                        data: {
                            action: 'IMPORT_APPLICANT',
                            entityType: 'Applicant',
                            entityId: applicant.id,
                            newValues: {
                                name: `${applicant.firstName} ${applicant.lastName}`,
                                passport: applicant.passportNumber,
                                importId
                            },
                            userId,
                            organizationId: orgId,
                        }
                    });
                    createdCount++;
                });
            }
            catch (error) {
                console.error('Failed to create applicant:', error);
            }
        }
        return createdCount;
    }
}
exports.ImportController = ImportController;
//# sourceMappingURL=import.controller.js.map