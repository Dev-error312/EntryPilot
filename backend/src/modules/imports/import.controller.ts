import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

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

      // Only admins can upload
      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can import files' 
        });
      }

      await this.ensureUploadsDir();

      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ 
          error: 'Bad Request', 
          message: 'No file uploaded' 
        });
      }

      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-excel', // xls
        'text/csv',
        'application/pdf',
        'image/jpeg',
        'image/png'
      ];

      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ 
          error: 'Bad Request', 
          message: 'Invalid file type. Supported: Excel, CSV, PDF, Images' 
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

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: 'UPLOAD_IMPORT',
          entityType: 'Import',
          entityId: importRecord.id,
          newValues: { 
            fileName: data.filename,
            fileType: data.mimetype
          },
          userId: user.id,
          organizationId: orgId
        }
      });

      return reply.status(201).send({
        id: importRecord.id,
        fileName: importRecord.fileName,
        fileType: importRecord.fileType,
        fileSize: importRecord.fileSize,
        status: importRecord.status,
        message: 'File uploaded successfully. Call /process to extract data.'
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
          message: 'Import already processed' 
        });
      }

      // Update status to processing
      await this.server.prisma.import.update({
        where: { id },
        data: { status: 'PROCESSING' }
      });

      // Process file based on type
      const filePath = path.join(UPLOADS_DIR, importRecord.filePath);
      let extractedData: any[] = [];

      try {
        if (importRecord.fileType === 'text/csv') {
          extractedData = await this.processCSV(filePath);
        } else if (importRecord.fileType.includes('spreadsheet') || importRecord.fileType.includes('excel')) {
          extractedData = await this.processExcel(filePath);
        } else if (importRecord.fileType === 'application/pdf') {
          extractedData = await this.processPDF(filePath);
        } else if (importRecord.fileType.startsWith('image/')) {
          extractedData = await this.processImage(filePath);
        }

        // Update import record with results
        const updated = await this.server.prisma.import.update({
          where: { id },
          data: {
            status: extractedData.length > 0 ? 'COMPLETED' : 'FAILED',
            totalCount: extractedData.length,
            processedCount: extractedData.length,
            metadata: { extractedData }
          }
        });

        // If groupId provided, create applicants
        if (importRecord.groupId && extractedData.length > 0) {
          await this.createApplicantsFromImport(
            extractedData,
            importRecord.groupId,
            orgId,
            user.id
          );
        }

        return reply.send({
          message: 'Import processed successfully',
          totalRecords: extractedData.length,
          applicants: extractedData
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

      return reply.send({
        id: importRecord.id,
        status: importRecord.status,
        totalCount: importRecord.totalCount,
        processedCount: importRecord.processedCount,
        errorCount: importRecord.errorCount,
        errors: importRecord.errors,
        data: importRecord.metadata
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  private async processCSV(filePath: string): Promise<any[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        this.mapField(header, value, record);
      });

      if (record.firstName || record.lastName) {
        results.push({
          ...record,
          confidence: 95 // CSV is structured, high confidence
        });
      }
    }

    return results;
  }

  private async processExcel(filePath: string): Promise<any[]> {
    // For MVP, we'll use a simple approach
    // In production, use xlsx library
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // Convert to CSV and process
      const csvPath = filePath + '.csv';
      // This is a placeholder - in real implementation use xlsx library
      return [];
    } catch {
      throw new Error('Excel processing failed');
    }
  }

  private async processPDF(filePath: string): Promise<any[]> {
    try {
      const pdfParse = require('pdf-parse');
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);

      // Extract structured data from PDF text
      const text = data.text;
      const applicants = this.extractApplicantData(text);

      return applicants.map(a => ({
        ...a,
        confidence: 70 // PDF extraction is less reliable
      }));
    } catch {
      throw new Error('PDF processing failed');
    }
  }

  private async processImage(filePath: string): Promise<any[]> {
    try {
      // In production, use Tesseract.js or OpenAI Vision
      // For MVP, return placeholder
      const confidence = 60;
      
      return [{
        firstName: 'OCR',
        lastName: 'Required',
        confidence,
        note: 'Image OCR requires Tesseract.js or AI Vision integration'
      }];
    } catch {
      throw new Error('Image OCR processing failed');
    }
  }

  private mapField(header: string, value: string, record: any) {
    const fieldMap: Record<string, string> = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'fname': 'firstName',
      'last name': 'lastName',
      'lastname': 'lastName',
      'lname': 'lastName',
      'surname': 'lastName',
      'email': 'email',
      'e-mail': 'email',
      'phone': 'phone',
      'mobile': 'phone',
      'telephone': 'phone',
      'date of birth': 'dob',
      'dob': 'dob',
      'birth date': 'dob',
      'gender': 'gender',
      'sex': 'gender',
      'nationality': 'nationality',
      'country': 'country',
      'passport': 'passportNumber',
      'passport number': 'passportNumber',
      'passport no': 'passportNumber',
      'address': 'address',
      'city': 'city'
    };

    const mappedField = fieldMap[header];
    if (mappedField && value) {
      record[mappedField] = value;
    }
  }

  private extractApplicantData(text: string): any[] {
    // Basic regex extraction for common form patterns
    const applicants: any[] = [];
    
    // This is a simplified extraction - production would use more sophisticated parsing
    const lines = text.split('\n');
    const currentApplicant: any = {};

    lines.forEach(line => {
      const lower = line.toLowerCase();
      
      if (lower.includes('first name') || lower.includes('given name')) {
        const match = line.match(/:\s*(.+)/);
        if (match) currentApplicant.firstName = match[1].trim();
      }
      if (lower.includes('last name') || lower.includes('surname')) {
        const match = line.match(/:\s*(.+)/);
        if (match) currentApplicant.lastName = match[1].trim();
      }
      if (lower.includes('passport')) {
        const match = line.match(/:\s*([A-Z0-9]+)/);
        if (match) currentApplicant.passportNumber = match[1].trim();
      }
    });

    if (currentApplicant.firstName || currentApplicant.lastName) {
      applicants.push(currentApplicant);
    }

    return applicants;
  }

  private async createApplicantsFromImport(
    data: any[],
    groupId: string,
    orgId: string,
    userId: string
  ) {
    for (const record of data) {
      if (!record.firstName && !record.lastName) continue;

      await this.server.prisma.applicant.create({
        data: {
          firstName: record.firstName || 'Unknown',
          lastName: record.lastName || 'Unknown',
          email: record.email,
          phone: record.phone,
          dob: record.dob ? new Date(record.dob) : null,
          gender: record.gender,
          nationality: record.nationality,
          passportNumber: record.passportNumber,
          address: record.address,
          city: record.city,
          country: record.country,
          groupId,
          organizationId: orgId,
          documents: { 
            importConfidence: record.confidence,
            importNote: record.note 
          }
        }
      });
    }
  }
}
