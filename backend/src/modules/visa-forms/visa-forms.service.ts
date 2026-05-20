import { PrismaClient } from '@prisma/client';
import { VISA_APPLICATION_FIELDS, formatFieldValue } from '../imports/visa-application-fields';

export class VisaFormsService {
  constructor(private prisma: PrismaClient) {}

  async createForm(data: any, organizationId: string, groupId: string) {
    const formData = {
      ...data,
      organizationId,
      groupId,
      status: 'DRAFT',
    };

    for (const field of VISA_APPLICATION_FIELDS) {
      if (formData[field.name]) {
        formData[field.name] = formatFieldValue(field, formData[field.name]);
      }
    }

    return this.prisma.visaApplicationForm.create({
      data: formData,
    });
  }

  async getForm(id: string) {
    return this.prisma.visaApplicationForm.findUnique({
      where: { id },
      include: { applicant: true },
    });
  }

  async listForms(organizationId: string, groupId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { organizationId, ...(groupId && { groupId }) };

    const [forms, total] = await Promise.all([
      this.prisma.visaApplicationForm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.visaApplicationForm.count({ where }),
    ]);

    return { forms, total, pages: Math.ceil(total / limit) };
  }

  async updateForm(id: string, data: any) {
    const formData = { ...data };

    for (const field of VISA_APPLICATION_FIELDS) {
      if (formData[field.name]) {
        formData[field.name] = formatFieldValue(field, formData[field.name]);
      }
    }

    return this.prisma.visaApplicationForm.update({
      where: { id },
      data: formData,
    });
  }

  async submitForm(id: string) {
    return this.prisma.visaApplicationForm.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  }

  async deleteForm(id: string) {
    return this.prisma.visaApplicationForm.delete({
      where: { id },
    });
  }

  validateRequiredFields(data: any): string[] {
    const errors: string[] = [];
    const requiredFields = VISA_APPLICATION_FIELDS.filter((f) => f.required);

    for (const field of requiredFields) {
      if (!data[field.name]) {
        errors.push(`${field.label} is required`);
      }
    }

    return errors;
  }
}
