"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visaFormsController = exports.VisaFormsController = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const uuid_1 = require("uuid");
const visa_forms_service_1 = require("./visa-forms.service");
const UPLOADS_DIR = path_1.default.join(process.cwd(), 'uploads');
const BOOLEAN_FIELDS = [
    'hasOtherNationality',
    'hasPermanentResidence',
    'hasFormerNationality',
    'hasBeenToChina',
    'hasValidVisas',
];
const DATE_FIELDS = [
    'workExperienceStartDate',
    'workExperienceEndDate',
    'spouseDateOfBirth',
    'fatherDateOfBirth',
    'motherDateOfBirth',
];
class VisaFormsController {
    async ensureUploadsDir() {
        try {
            await promises_1.default.access(UPLOADS_DIR);
        }
        catch {
            await promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
        }
    }
    async saveUploadedDocument(request, filePart, organizationId, uploadedBy, associatedWith) {
        await this.ensureUploadsDir();
        const buffer = await filePart.toBuffer();
        const documentId = (0, uuid_1.v4)();
        const extension = path_1.default.extname(filePart.filename);
        const fileName = `${documentId}${extension}`;
        const filePath = path_1.default.join(UPLOADS_DIR, fileName);
        await promises_1.default.writeFile(filePath, buffer);
        const prisma = request.server.prisma;
        const document = await prisma.visaApplicationDocument.create({
            data: {
                fileName: filePart.filename,
                fileType: filePart.mimetype,
                filePath: fileName,
                fileSize: buffer.length,
                mimeType: filePart.mimetype,
                documentCategory: 'VISA_FORM',
                documentType: filePart.fieldname,
                uploadedBy,
                associatedWith: associatedWith || null,
                status: 'PENDING',
                organizationId,
            },
        });
        return document.id;
    }
    normalizeFormData(data) {
        const normalized = { ...data };
        for (const field of BOOLEAN_FIELDS) {
            if (typeof normalized[field] === 'string') {
                normalized[field] = normalized[field] === 'true';
            }
        }
        for (const field of DATE_FIELDS) {
            if (typeof normalized[field] === 'string') {
                normalized[field] = normalized[field].trim() ? new Date(normalized[field]) : undefined;
            }
        }
        if (typeof normalized.children === 'string') {
            try {
                normalized.children = JSON.parse(normalized.children);
            }
            catch {
                normalized.children = normalized.children;
            }
        }
        return normalized;
    }
    async create(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const parsedData = {};
            const queuedFiles = [];
            if (typeof request.isMultipart === 'function' && request.isMultipart()) {
                for await (const part of request.parts()) {
                    if (part.type === 'file') {
                        queuedFiles.push(part);
                    }
                    else {
                        parsedData[part.fieldname] = part.value;
                    }
                }
            }
            else {
                Object.assign(parsedData, request.body);
            }
            const uploadedBy = user.id;
            const applicantId = parsedData.applicantId ? String(parsedData.applicantId) : null;
            const fileIdsByField = {};
            for (const filePart of queuedFiles) {
                const documentId = await this.saveUploadedDocument(request, filePart, organizationId, uploadedBy, applicantId);
                fileIdsByField[filePart.fieldname] = [
                    ...(fileIdsByField[filePart.fieldname] || []),
                    documentId,
                ];
            }
            if (fileIdsByField.visaPhoto?.[0]) {
                parsedData.visaPhotoId = fileIdsByField.visaPhoto[0];
            }
            if (fileIdsByField.passportPage1?.length) {
                parsedData.passportPage1Id = JSON.stringify(fileIdsByField.passportPage1);
            }
            if (fileIdsByField.passportPage2?.length) {
                parsedData.passportPage2Id = JSON.stringify(fileIdsByField.passportPage2);
            }
            if (fileIdsByField.passportBackPage?.length) {
                parsedData.passportBackPageId = JSON.stringify(fileIdsByField.passportBackPage);
            }
            if (fileIdsByField.previousChineseVisaFiles?.length) {
                parsedData.previousChineseVisaIds = JSON.stringify(fileIdsByField.previousChineseVisaFiles);
            }
            const normalizedData = this.normalizeFormData(parsedData);
            const visaForm = await visa_forms_service_1.visaFormsService.createVisaForm(normalizedData, organizationId);
            reply.code(201).send({
                success: true,
                data: visaForm,
                message: 'Visa form created successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async get(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            const visaForm = await visa_forms_service_1.visaFormsService.getVisaForm(id, organizationId);
            if (!visaForm) {
                return reply.code(404).send({
                    success: false,
                    error: 'Visa form not found'
                });
            }
            reply.send({
                success: true,
                data: visaForm
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async list(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { groupId } = request.query;
            const visaForms = await visa_forms_service_1.visaFormsService.listVisaForms(organizationId, groupId);
            reply.send({
                success: true,
                data: visaForms,
                count: visaForms.length
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async update(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            const visaForm = await visa_forms_service_1.visaFormsService.updateVisaForm(id, request.body, organizationId);
            reply.send({
                success: true,
                data: visaForm,
                message: 'Visa form updated successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async submit(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            const visaForm = await visa_forms_service_1.visaFormsService.submitVisaForm(id, organizationId);
            reply.send({
                success: true,
                data: visaForm,
                message: 'Visa form submitted successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
    async delete(request, reply) {
        try {
            const user = request.user;
            const organizationId = user.organizationId;
            const { id } = request.params;
            await visa_forms_service_1.visaFormsService.deleteVisaForm(id, organizationId);
            reply.send({
                success: true,
                message: 'Visa form deleted successfully'
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    }
}
exports.VisaFormsController = VisaFormsController;
exports.visaFormsController = new VisaFormsController();
//# sourceMappingURL=visa-forms.controller.js.map