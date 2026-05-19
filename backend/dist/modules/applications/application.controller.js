"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const zod_1 = require("zod");
const createApplicationSchema = zod_1.z.object({
    applicantId: zod_1.z.string().min(1),
    visaType: zod_1.z.string().min(1),
    destinationCountry: zod_1.z.string().min(1),
    templateId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    documents: zod_1.z.any().optional()
});
const updateApplicationSchema = zod_1.z.object({
    visaType: zod_1.z.string().min(1).optional(),
    destinationCountry: zod_1.z.string().optional(),
    templateId: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    documents: zod_1.z.any().optional()
});
const statusTransitions = {
    DRAFT: ['REVIEW'],
    REVIEW: ['READY', 'DRAFT'],
    READY: ['SUBMITTED', 'REVIEW'],
    SUBMITTED: ['PROCESSING'],
    PROCESSING: ['APPROVED', 'REJECTED'],
    REJECTED: ['DRAFT'],
    APPROVED: ['DELIVERED']
};
class ApplicationController {
    constructor(server) {
        this.server = server;
        this.create = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const body = createApplicationSchema.parse(request.body);
                // Validate applicant belongs to organization
                const applicant = await this.server.prisma.applicant.findFirst({
                    where: {
                        id: body.applicantId,
                        organizationId: orgId,
                        isActive: true
                    },
                    include: { group: true }
                });
                if (!applicant) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Invalid applicant ID'
                    });
                }
                // Employees can only create applications for their assigned groups
                if (user.role === 'AGENCY_EMPLOYEE' &&
                    applicant.group.assignedEmployeeId !== user.id) {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'You can only create applications for your assigned groups'
                    });
                }
                // Validate template if provided
                if (body.templateId) {
                    const template = await this.server.prisma.template.findFirst({
                        where: {
                            id: body.templateId,
                            organizationId: orgId,
                            isActive: true
                        }
                    });
                    if (!template) {
                        return reply.status(400).send({
                            error: 'Bad Request',
                            message: 'Invalid template ID'
                        });
                    }
                }
                const application = await this.server.prisma.$transaction(async (tx) => {
                    const created = await tx.application.create({
                        data: {
                            referenceNumber: this.generateReferenceNumber(),
                            visaType: body.visaType,
                            destinationCountry: body.destinationCountry,
                            notes: body.notes,
                            documents: body.documents,
                            applicantId: body.applicantId,
                            templateId: body.templateId,
                            organizationId: orgId
                        },
                        include: {
                            applicant: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    passportNumber: true
                                }
                            },
                            template: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    });
                    // Audit log
                    await tx.auditLog.create({
                        data: {
                            action: 'CREATE_APPLICATION',
                            entityType: 'Application',
                            entityId: created.id,
                            newValues: {
                                referenceNumber: created.referenceNumber,
                                visaType: created.visaType,
                                applicant: `${applicant.firstName} ${applicant.lastName}`
                            },
                            userId: user.id,
                            organizationId: orgId,
                            applicationId: created.id
                        }
                    });
                    return created;
                });
                return reply.status(201).send(application);
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
                const user = request.user;
                const { page = 1, limit = 20, search, status, visaType, destinationCountry } = request.query;
                const where = { organizationId: orgId };
                if (status)
                    where.status = status;
                if (visaType)
                    where.visaType = visaType;
                if (destinationCountry)
                    where.destinationCountry = destinationCountry;
                if (search) {
                    where.OR = [
                        { referenceNumber: { contains: search, mode: 'insensitive' } },
                        {
                            applicant: {
                                OR: [
                                    { firstName: { contains: search, mode: 'insensitive' } },
                                    { lastName: { contains: search, mode: 'insensitive' } },
                                    { passportNumber: { contains: search, mode: 'insensitive' } }
                                ]
                            }
                        }
                    ];
                }
                // Employees can only see applications from their assigned groups
                if (user.role === 'AGENCY_EMPLOYEE') {
                    where.applicant = {
                        group: { assignedEmployeeId: user.id }
                    };
                }
                const [applications, total] = await Promise.all([
                    this.server.prisma.application.findMany({
                        where,
                        skip: (page - 1) * limit,
                        take: parseInt(limit),
                        orderBy: { createdAt: 'desc' },
                        include: {
                            applicant: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    passportNumber: true,
                                    nationality: true,
                                    group: {
                                        select: {
                                            id: true,
                                            code: true,
                                            name: true
                                        }
                                    }
                                }
                            },
                            template: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }),
                    this.server.prisma.application.count({ where })
                ]);
                return reply.send({
                    data: applications,
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
        this.listByStatus = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const user = request.user;
                const { status } = request.params;
                const where = { organizationId: orgId, status };
                if (user.role === 'AGENCY_EMPLOYEE') {
                    where.applicant = {
                        group: { assignedEmployeeId: user.id }
                    };
                }
                const applications = await this.server.prisma.application.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        applicant: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                group: {
                                    select: {
                                        code: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                });
                return reply.send(applications);
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
                const user = request.user;
                const { id } = request.params;
                const application = await this.server.prisma.application.findFirst({
                    where: { id, organizationId: orgId },
                    include: {
                        applicant: {
                            include: {
                                group: {
                                    select: {
                                        id: true,
                                        code: true,
                                        name: true,
                                        assignedEmployeeId: true
                                    }
                                }
                            }
                        },
                        template: true,
                        auditLogs: {
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                });
                if (!application) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Application not found'
                    });
                }
                // Employees can only view applications from their assigned groups
                if (user.role === 'AGENCY_EMPLOYEE' &&
                    application.applicant.group.assignedEmployeeId !== user.id) {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Access denied'
                    });
                }
                return reply.send(application);
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
                const body = updateApplicationSchema.parse(request.body);
                const existing = await this.server.prisma.application.findFirst({
                    where: { id, organizationId: orgId },
                    include: {
                        applicant: {
                            include: { group: true }
                        }
                    }
                });
                if (!existing) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Application not found'
                    });
                }
                // Can only edit in DRAFT or REJECTED status
                if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Can only edit applications in DRAFT or REJECTED status'
                    });
                }
                // Employees can only update applications from their assigned groups
                if (user.role === 'AGENCY_EMPLOYEE' &&
                    existing.applicant.group.assignedEmployeeId !== user.id) {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Access denied'
                    });
                }
                const updated = await this.server.prisma.application.update({
                    where: { id },
                    data: body,
                    include: {
                        applicant: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        },
                        template: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                });
                // Audit log
                await this.server.prisma.auditLog.create({
                    data: {
                        action: 'UPDATE_APPLICATION',
                        entityType: 'Application',
                        entityId: id,
                        oldValues: existing,
                        newValues: body,
                        userId: user.id,
                        organizationId: orgId,
                        applicationId: id
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
        this.submit = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                // Only admins can submit
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can submit applications'
                    });
                }
                const updated = await this.updateStatus(this.server, id, 'SUBMITTED', user.id, orgId);
                return reply.send({
                    message: 'Application submitted successfully',
                    application: updated
                });
            }
            catch (error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message
                });
            }
        };
        this.approve = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can approve applications'
                    });
                }
                const updated = await this.updateStatus(this.server, id, 'APPROVED', user.id, orgId);
                return reply.send({
                    message: 'Application approved successfully',
                    application: updated
                });
            }
            catch (error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message
                });
            }
        };
        this.reject = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                const { reason } = request.body;
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can reject applications'
                    });
                }
                if (!reason) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Rejection reason is required'
                    });
                }
                const updated = await this.updateStatus(this.server, id, 'REJECTED', user.id, orgId, { reason });
                return reply.send({
                    message: 'Application rejected',
                    application: updated
                });
            }
            catch (error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message
                });
            }
        };
        this.deliver = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can mark applications as delivered'
                    });
                }
                const updated = await this.updateStatus(this.server, id, 'DELIVERED', user.id, orgId);
                return reply.send({
                    message: 'Application marked as delivered',
                    application: updated
                });
            }
            catch (error) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: error.message
                });
            }
        };
    }
    generateReferenceNumber() {
        const prefix = 'VF';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
    async updateStatus(server, applicationId, newStatus, userId, orgId, extraData) {
        const application = await server.prisma.application.findFirst({
            where: { id: applicationId, organizationId: orgId }
        });
        if (!application) {
            throw new Error('Application not found');
        }
        const allowedNext = statusTransitions[application.status];
        if (!allowedNext || !allowedNext.includes(newStatus)) {
            throw new Error(`Cannot transition from ${application.status} to ${newStatus}`);
        }
        const updateData = { status: newStatus };
        // Set timestamps based on status
        switch (newStatus) {
            case 'SUBMITTED':
                updateData.submittedAt = new Date();
                break;
            case 'PROCESSING':
                updateData.processedAt = new Date();
                break;
            case 'APPROVED':
                updateData.approvedAt = new Date();
                break;
            case 'REJECTED':
                updateData.rejectedAt = new Date();
                if (extraData?.reason) {
                    updateData.rejectionReason = extraData.reason;
                }
                break;
            case 'DELIVERED':
                // deliveredAt could be added if needed
                break;
        }
        return server.prisma.$transaction(async (tx) => {
            const updated = await tx.application.update({
                where: { id: applicationId },
                data: updateData
            });
            await tx.auditLog.create({
                data: {
                    action: `UPDATE_APPLICATION_STATUS`,
                    entityType: 'Application',
                    entityId: applicationId,
                    oldValues: { status: application.status },
                    newValues: { status: newStatus, ...extraData },
                    userId,
                    organizationId: orgId,
                    applicationId
                }
            });
            return updated;
        });
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=application.controller.js.map