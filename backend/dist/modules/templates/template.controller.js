"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const zod_1 = require("zod");
const fieldSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    type: zod_1.z.enum(['text', 'number', 'date', 'select', 'textarea', 'checkbox', 'file']),
    required: zod_1.z.boolean().default(false),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    placeholder: zod_1.z.string().optional(),
    validation: zod_1.z.object({
        minLength: zod_1.z.number().optional(),
        maxLength: zod_1.z.number().optional(),
        pattern: zod_1.z.string().optional()
    }).optional()
});
const conditionSchema = zod_1.z.object({
    field: zod_1.z.string(),
    operator: zod_1.z.enum(['equals', 'not_equals', 'contains', 'exists']),
    value: zod_1.z.string().optional(),
    showFields: zod_1.z.array(zod_1.z.string())
});
const createTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    country: zod_1.z.string().min(2),
    visaType: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    fields: zod_1.z.array(fieldSchema),
    conditions: zod_1.z.array(conditionSchema).optional(),
    organizationId: zod_1.z.string().optional()
});
const updateTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional().nullable(),
    fields: zod_1.z.array(fieldSchema).optional(),
    conditions: zod_1.z.array(conditionSchema).optional().nullable()
});
class TemplateController {
    constructor(server) {
        this.server = server;
        this.create = async (request, reply) => {
            try {
                const user = request.user;
                let orgId = request.organizationId;
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
            }
            catch (error) {
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
        this.list = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { page = 1, limit = 20, search, country, visaType, isActive = 'true' } = request.query;
                const where = { organizationId: orgId };
                if (isActive !== undefined)
                    where.isActive = isActive === 'true';
                if (country)
                    where.country = country;
                if (visaType)
                    where.visaType = visaType;
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
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.listByCountry = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const { country } = request.params;
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
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.update = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
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
                const updateData = { ...body };
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
            }
            catch (error) {
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
        this.toggleActive = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
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
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.delete = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
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
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
    }
}
exports.TemplateController = TemplateController;
//# sourceMappingURL=template.controller.js.map