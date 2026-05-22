import { FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { visaFormsService } from './visa-forms.service';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

type MultipartFilePart = {
  type: 'file';
  fieldname: string;
  filename: string;
  mimetype: string;
  toBuffer: () => Promise<Buffer>;
};

type MultipartFieldPart = {
  type: 'field';
  fieldname: string;
  value: string;
};

type MultipartPart = MultipartFilePart | MultipartFieldPart;

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

export class VisaFormsController {
  private async ensureUploadsDir() {
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
  }

  private async saveUploadedDocument(
    request: FastifyRequest,
    filePart: MultipartFilePart,
    organizationId: string,
    uploadedBy: string,
    associatedWith?: string | null
  ) {
    await this.ensureUploadsDir();

    const buffer = await filePart.toBuffer();
    const documentId = uuidv4();
    const extension = path.extname(filePart.filename);
    const fileName = `${documentId}${extension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    const prisma = (request.server as any).prisma;
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

  private normalizeFormData(data: Record<string, any>) {
    const normalized: Record<string, any> = { ...data };

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
      } catch {
        normalized.children = normalized.children;
      }
    }

    return normalized;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const parsedData: Record<string, any> = {};
      const queuedFiles: MultipartFilePart[] = [];

      if (typeof (request as any).isMultipart === 'function' && (request as any).isMultipart()) {
        for await (const part of request.parts() as AsyncIterable<MultipartPart>) {
          if (part.type === 'file') {
            queuedFiles.push(part);
          } else {
            parsedData[part.fieldname] = part.value;
          }
        }
      } else {
        Object.assign(parsedData, request.body as any);
      }

      const uploadedBy = user.id;
      const applicantId = parsedData.applicantId ? String(parsedData.applicantId) : null;
      const fileIdsByField: Record<string, string[]> = {};

      for (const filePart of queuedFiles) {
        const documentId = await this.saveUploadedDocument(
          request,
          filePart,
          organizationId,
          uploadedBy,
          applicantId
        );

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

      const visaForm = await visaFormsService.createVisaForm(normalizedData, organizationId);

      reply.code(201).send({
        success: true,
        data: visaForm,
        message: 'Visa form created successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      const visaForm = await visaFormsService.getVisaForm(id, organizationId);

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
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { groupId } = request.query as any;

      const visaForms = await visaFormsService.listVisaForms(organizationId, groupId);

      reply.send({
        success: true,
        data: visaForms,
        count: visaForms.length
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      const visaForm = await visaFormsService.updateVisaForm(
        id,
        request.body,
        organizationId
      );

      reply.send({
        success: true,
        data: visaForm,
        message: 'Visa form updated successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async submit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      const visaForm = await visaFormsService.submitVisaForm(id, organizationId);

      reply.send({
        success: true,
        data: visaForm,
        message: 'Visa form submitted successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const organizationId = user.organizationId;
      const { id } = request.params as any;

      await visaFormsService.deleteVisaForm(id, organizationId);

      reply.send({
        success: true,
        message: 'Visa form deleted successfully'
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }
}

export const visaFormsController = new VisaFormsController();
