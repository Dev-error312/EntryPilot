import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'date', 'select', 'textarea', 'checkbox', 'file']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional()
  }).optional()
});

const conditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'exists']),
  value: z.string().optional(),
  showFields: z.array(z.string())
});

const createTemplateSchema = z.object({
  name: z.string().min(2),
  country: z.string().min(2),
  visaType: z.string().min(2),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
  conditions: z.array(conditionSchema).optional(),
  organizationId: z.string().optional()
});

const updateTemplateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  fields: z.array(fieldSchema).optional(),
  conditions: z.array(conditionSchema).optional().nullable()
});

export class TemplateController {
  constructor(private server: FastifyInstance) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      let orgId = (request as any).organizationId;

      // Only admins can create templates
      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can create templates' 
        });
      }

      const body = createTemplateSchema.parse(request.body);

      // Super admins must specify organizationId
      if (user.role === 'SUPER_ADMIN') {
        if (!body.organizationId) {
          return reply.status(400).send({ 
            error: 'Bad Request', 
            message: 'Super admins must specify organizationId' 
          });
        }
        orgId = body.organizationId;
      }

      // Check if template already exists
      const existing = await this.server.prisma.template.findFirst({
        where: {
          name: body.name,
          country: body.country,
          visaType: body.visaType,
          organizationId: orgId
        }
      });

      if (existing) {
        return reply.status(409).send({ 
          error: 'Conflict', 
          message: 'Template with this name, country, and visa type already exists' 
        });
      }

      const template = await this.server.prisma.$transaction(async (tx) => {
        const created = await tx.template.create({
          data: {
            name: body.name,
            country: body.country,
            visaType: body.visaType,
            description: body.description,
            fields: body.fields,
            conditions: body.conditions,
            organizationId: orgId
          }
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            action: 'CREATE_TEMPLATE',
            entityType: 'Template',
            entityId: created.id,
            newValues: { 
              name: created.name,
              country: created.country,
              visaType: created.visaType
            },
            userId: user.id,
            organizationId: orgId
          }
        });

        return created;
      });

      return reply.status(201).send(template);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ 
          error: 'Validation Error', 
          details: error.errors 
        });
      }
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const { 
        page = 1, 
        limit = 20, 
        search, 
        country,
        visaType,
        isActive = 'true'
      } = request.query as any;

      const where: any = { organizationId: orgId };

      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (country) where.country = country;
      if (visaType) where.visaType = visaType;
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
          { visaType: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [templates, total] = await Promise.all([
        this.server.prisma.template.findMany({
          where,
          skip: (page - 1) * limit,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { applications: true }
            }
          }
        }),
        this.server.prisma.template.count({ where })
      ]);

      return reply.send({
        data: templates,
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

  listByCountry = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const { country } = request.params as any;

      const templates = await this.server.prisma.template.findMany({
        where: { 
          organizationId: orgId,
          country,
          isActive: true
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          visaType: true,
          description: true,
          fields: true,
          conditions: true
        }
      });

      return reply.send(templates);
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

      const template = await this.server.prisma.template.findFirst({
        where: { id, organizationId: orgId },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      });

      if (!template) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Template not found' 
        });
      }

      return reply.send(template);
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      // Only admins can update templates
      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can update templates' 
        });
      }

      const body = updateTemplateSchema.parse(request.body);

      const existing = await this.server.prisma.template.findFirst({
        where: { id, organizationId: orgId }
      });

      if (!existing) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Template not found' 
        });
      }

      // Increment version if fields changed
      const updateData: any = { ...body };
      if (body.fields) {
        updateData.version = existing.version + 1;
      }

      const updated = await this.server.prisma.template.update({
        where: { id },
        data: updateData
      });

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: 'UPDATE_TEMPLATE',
          entityType: 'Template',
          entityId: id,
          oldValues: existing,
          newValues: body,
          userId: user.id,
          organizationId: orgId
        }
      });

      return reply.send(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ 
          error: 'Validation Error', 
          details: error.errors 
        });
      }
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  toggleActive = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      // Only admins can toggle templates
      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can manage templates' 
        });
      }

      const template = await this.server.prisma.template.findFirst({
        where: { id, organizationId: orgId }
      });

      if (!template) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Template not found' 
        });
      }

      const updated = await this.server.prisma.template.update({
        where: { id },
        data: { isActive: !template.isActive }
      });

      return reply.send({ 
        message: `Template ${updated.isActive ? 'activated' : 'deactivated'}`,
        isActive: updated.isActive 
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can delete templates' 
        });
      }

      const template = await this.server.prisma.template.findFirst({
        where: { 
          id,
          ...(user.role === 'SUPER_ADMIN' ? {} : { organizationId: orgId })
        }
      });

      if (!template) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Template not found' 
        });
      }

      // Soft delete - just mark as inactive
      const deleted = await this.server.prisma.template.update({
        where: { id },
        data: { isActive: false }
      });

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: 'DELETE_TEMPLATE',
          entityType: 'Template',
          entityId: id,
          oldValues: { name: template.name },
          userId: user.id,
          organizationId: template.organizationId
        }
      });

      return reply.send({ 
        message: 'Template deleted successfully'
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };
}
