import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import * as XLSX from 'xlsx';
import {
  parseExcelData,
  parsePDFText,
  parseOCRText,
  validateApplicantData,
  transformToApplicant,
  ParseResult
} from './china-visa-parser';
import { CHINA_VISA_FIELDS } from './china-visa-fields';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export class ImportController {
  constructor(private server: FastifyInstance) {}

  async ensureUploadsDir() {
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
  }

  upload = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;

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

      const fileId = uuidv4();
      const ext = path.extname(data.filename);
      const fileName = `${fileId}${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      // Save file
      const buffer = await data.toBuffer();
      await fs.writeFile(filePath, buffer);

      // Get groupId from fields
      const fields = data.fields;
      const groupId = (fields.groupId as any)?.value;

      // Create import record
      const importRecord = await this.server.prisma.import.create({
        data: {
          fileName: data.filename,
          fileType: data.mimetype,
          fileSize: buffer.length,
          filePath: fileName,
          status: 'PENDING',
          organizationId: orgId,
          groupId: groupId as string
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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const { page = 1, limit = 20, status } = request.query as any;

      const where: any = { organizationId: orgId };
      if (status) where.status = status;

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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  process = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

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
      const filePath = path.join(UPLOADS_DIR, importRecord.filePath);
      let parseResult: ParseResult;

      try {
        if (importRecord.fileType === 'text/csv') {
          parseResult = await this.processCSV(filePath);
        } else if (importRecord.fileType.includes('spreadsheet') || importRecord.fileType.includes('excel')) {
          parseResult = await this.processExcel(filePath);
        } else if (importRecord.fileType === 'application/pdf') {
          parseResult = await this.processPDF(filePath);
        } else if (importRecord.fileType.startsWith('image/')) {
          parseResult = await this.processImage(filePath);
        } else {
          throw new Error('Unsupported file type');
        }

        // Create applicants if groupId provided and we have valid data
        if (importRecord.groupId && parseResult.applicants.length > 0) {
          const validApplicants = parseResult.applicants.filter(a => a.missingRequired.length === 0);
          const createdCount = await this.createApplicantsFromImport(
            validApplicants,
            importRecord.groupId,
            orgId,
            user.id
          );
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
            metadata: { 
              applicants: JSON.stringify(parseResult.applicants),
              parsedAt: new Date().toISOString()
            } as any
          }
        });

        return reply.send({
          message: parseResult.successCount > 0 
            ? `Successfully processed ${parseResult.successCount} applicant(s)` 
            : 'Processing completed with errors',
          ...parseResult,
          applicants: parseResult.applicants.map(a => ({
            ...a,
            validation: validateApplicantData(a.data)
          }))
        });
      } catch (processError: any) {
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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  getResults = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      const importRecord = await this.server.prisma.import.findFirst({
        where: { id, organizationId: orgId }
      });

      if (!importRecord) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Import not found' 
        });
      }

      // Parse metadata to get applicants
      let applicants: any[] = [];
      let parsedAt = new Date().toISOString();
      try {
        if (importRecord.metadata) {
          const meta = typeof importRecord.metadata === 'string' 
            ? JSON.parse(importRecord.metadata) 
            : importRecord.metadata;
          
          if (meta?.applicants) {
            if (typeof meta.applicants === 'string') {
              applicants = JSON.parse(meta.applicants);
            } else if (Array.isArray(meta.applicants)) {
              applicants = meta.applicants;
            }
          }
          if (meta?.parsedAt) {
            parsedAt = meta.parsedAt;
          }
        }
      } catch (parseErr) {
        console.error('Error parsing metadata:', parseErr);
        applicants = [];
      }

      // Extract warnings from errors
      const warnings = Array.isArray((importRecord.errors as any)?.warnings) 
        ? (importRecord.errors as any).warnings 
        : [];

      return reply.send({
        data: {
          id: importRecord.id,
          status: importRecord.status,
          totalCount: importRecord.totalCount,
          processedCount: importRecord.processedCount,
          errorCount: importRecord.errorCount,
          warnings: warnings,
          applicants: applicants || [],
          errors: importRecord.errors
        }
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  getFields = async (request: FastifyRequest, reply: FastifyReply) => {
    // Return field definitions for frontend
    return reply.send({
      fields: CHINA_VISA_FIELDS,
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

  // ==================== FILE PROCESSORS ====================

  private async processCSV(filePath: string): Promise<ParseResult> {
    const content = await fs.readFile(filePath, 'utf-8');
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

    // Parse CSV into rows
    const rows = lines.map(line => this.parseCSVLine(line));
    return parseExcelData(rows);
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private async processExcel(filePath: string): Promise<ParseResult> {
    try {
      // Read the Excel file using xlsx
      const workbook = XLSX.readFile(filePath);
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to array of arrays
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (rows.length < 2) {
        return {
          applicants: [],
          totalProcessed: 0,
          successCount: 0,
          errorCount: 0,
          warnings: ['Excel file is empty or has no data rows'],
        };
      }

      return parseExcelData(rows);
    } catch (error: any) {
      return {
        applicants: [],
        totalProcessed: 0,
        successCount: 0,
        errorCount: 1,
        warnings: [`Excel parsing error: ${error.message}`],
      };
    }
  }

  private async processPDF(filePath: string): Promise<ParseResult> {
    try {
      const pdfParse = require('pdf-parse');
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      
      return parsePDFText(data.text);
    } catch (error: any) {
      return {
        applicants: [],
        totalProcessed: 0,
        successCount: 0,
        errorCount: 1,
        warnings: [`PDF parsing error: ${error.message}`],
      };
    }
  }

  private async processImage(filePath: string): Promise<ParseResult> {
    try {
      // Use Tesseract.js for OCR
      const { createWorker } = require('tesseract.js');
      const worker = await createWorker('eng');
      
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      
      return parseOCRText(text);
    } catch (error: any) {
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

  private async createApplicantsFromImport(
    parsedApplicants: any[],
    groupId: string,
    orgId: string,
    userId: string
  ): Promise<number> {
    let createdCount = 0;

    for (const parsed of parsedApplicants) {
      try {
        const applicantData = transformToApplicant(parsed.data, groupId);

        // Skip if no name
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
              documents: applicantData.documents,
            }
          });

          // Create audit log
          await tx.auditLog.create({
            data: {
              action: 'IMPORT_APPLICANT',
              entityType: 'Applicant',
              entityId: applicant.id,
              newValues: {
                name: `${applicant.firstName} ${applicant.lastName}`,
                passport: applicant.passportNumber,
                source: parsed.source,
                confidence: parsed.confidence,
              },
              userId,
              organizationId: orgId,
            }
          });

          createdCount++;
        });
      } catch (error) {
        console.error('Failed to create applicant:', error);
      }
    }

    return createdCount;
  }
}
