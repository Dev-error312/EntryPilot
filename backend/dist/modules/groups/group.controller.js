"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
const zod_1 = require("zod");
const createGroupSchema = zod_1.z.object({
    code: zod_1.z.string().min(2, 'Code must be at least 2 characters').max(20, 'Code must be at most 20 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    travelDate: zod_1.z.string().datetime().optional(),
    externalAgent: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    assignedEmployeeId: zod_1.z.string().optional()
});
const updateGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    travelDate: zod_1.z.string().datetime().optional().nullable(),
    externalAgent: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    assignedEmployeeId: zod_1.z.string().optional().nullable()
});
class GroupController {
    constructor(server) {
        this.server = server;
        this.create = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const body = createGroupSchema.parse(request.body);
                // Check if code already exists in organization
                const existing = await this.server.prisma.group.findFirst({
                    where: {
                        code: body.code.toUpperCase(),
                        organizationId: orgId
                    }
                });
                if (existing) {
                    return reply.status(409).send({
                        error: 'Conflict',
                        message: 'Group code already exists in your organization'
                    });
                }
                // Validate assigned employee if provided
                if (body.assignedEmployeeId) {
                    const employee = await this.server.prisma.user.findFirst({
                        where: {
                            id: body.assignedEmployeeId,
                            organizationId: orgId,
                            isActive: true
                        }
                    });
                    if (!employee) {
                        return reply.status(400).send({
                            error: 'Bad Request',
                            message: 'Invalid employee ID'
                        });
                    }
                }
                const group = await this.server.prisma.$transaction(async (tx) => {
                    const createData = {
                        code: body.code.toUpperCase(),
                        name: body.name,
                        organizationId: orgId
                    };
                    // Only add optional fields if they have values
                    if (body.travelDate) {
                        createData.travelDate = new Date(body.travelDate);
                    }
                    if (body.externalAgent) {
                        createData.externalAgent = body.externalAgent;
                    }
                    if (body.notes) {
                        createData.notes = body.notes;
                    }
                    if (body.assignedEmployeeId) {
                        createData.assignedEmployeeId = body.assignedEmployeeId;
                    }
                    const created = await tx.group.create({
                        data: createData,
                        include: {
                            assignedEmployee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            },
                            _count: {
                                select: { applicants: true }
                            }
                        }
                    });
                    // Audit log
                    await tx.auditLog.create({
                        data: {
                            action: 'CREATE_GROUP',
                            entityType: 'Group',
                            entityId: created.id,
                            newValues: { code: created.code, name: created.name },
                            userId: user.id,
                            organizationId: orgId
                        }
                    });
                    return created;
                });
                return reply.status(201).send(group);
            }
            catch (error) {
                if (error.name === 'ZodError') {
                    const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                    return reply.status(400).send({
                        error: 'Validation Error',
                        message: messages,
                        details: error.errors
                    });
                }
                console.error('Group creation error:', error);
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
                const { page = 1, limit = 20, search, isActive, assignedEmployeeId } = request.query;
                const where = { organizationId: orgId };
                if (search) {
                    where.OR = [
                        { code: { contains: search, mode: 'insensitive' } },
                        { name: { contains: search, mode: 'insensitive' } }
                    ];
                }
                if (isActive !== undefined)
                    where.isActive = isActive === 'true';
                if (assignedEmployeeId)
                    where.assignedEmployeeId = assignedEmployeeId;
                // Employees can only see their assigned groups
                if (user.role === 'AGENCY_EMPLOYEE') {
                    where.assignedEmployeeId = user.id;
                }
                const [groups, total] = await Promise.all([
                    this.server.prisma.group.findMany({
                        where,
                        skip: (page - 1) * limit,
                        take: parseInt(limit),
                        orderBy: { createdAt: 'desc' },
                        include: {
                            assignedEmployee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            },
                            _count: {
                                select: { applicants: true }
                            }
                        }
                    }),
                    this.server.prisma.group.count({ where })
                ]);
                return reply.send({
                    data: groups,
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
        this.listActive = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const user = request.user;
                // Query parameters with defaults
                const { page = '1', limit = '20', search = '', sortBy = 'createdAt', sortOrder = 'desc' } = request.query;
                const pageNum = Math.max(1, parseInt(page));
                const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100
                const where = {
                    organizationId: orgId,
                    isActive: true
                };
                // Employee can only see assigned groups
                if (user.role === 'AGENCY_EMPLOYEE') {
                    where.assignedEmployeeId = user.id;
                }
                // Search filter: code OR name
                if (search && search.trim()) {
                    where.OR = [
                        { code: { contains: search.toUpperCase(), mode: 'insensitive' } },
                        { name: { contains: search, mode: 'insensitive' } }
                    ];
                }
                // Sort configuration
                const orderBy = {};
                const validSortFields = ['code', 'name', 'createdAt', 'travelDate'];
                const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
                orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';
                // Parallel queries for groups and total count
                const [groups, total] = await Promise.all([
                    this.server.prisma.group.findMany({
                        where,
                        orderBy,
                        take: limitNum,
                        skip: (pageNum - 1) * limitNum,
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            travelDate: true,
                            isActive: true,
                            createdAt: true,
                            assignedEmployee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            },
                            _count: {
                                select: { applicants: true }
                            }
                        }
                    }),
                    this.server.prisma.group.count({ where })
                ]);
                const totalPages = Math.ceil(total / limitNum);
                return reply.send({
                    data: groups,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        pages: totalPages,
                        hasMore: pageNum < totalPages
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
                const user = request.user;
                const { id } = request.params;
                // Pagination for applicants
                const { applicantPage = '1', applicantLimit = '50' } = request.query;
                const appPageNum = Math.max(1, parseInt(applicantPage));
                const appLimitNum = Math.min(100, Math.max(1, parseInt(applicantLimit)));
                const where = { id, organizationId: orgId };
                if (user.role === 'AGENCY_EMPLOYEE') {
                    where.assignedEmployeeId = user.id;
                }
                // Get group details (WITHOUT applicants yet)
                const group = await this.server.prisma.group.findFirst({
                    where,
                    include: {
                        assignedEmployee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        },
                        _count: {
                            select: { applicants: true }
                        }
                    }
                });
                if (!group) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Group not found'
                    });
                }
                // Get paginated applicants in parallel with group
                const [applicants, applicantCount] = await Promise.all([
                    this.server.prisma.applicant.findMany({
                        where: { groupId: id, isActive: true },
                        orderBy: { lastName: 'asc' },
                        take: appLimitNum,
                        skip: (appPageNum - 1) * appLimitNum,
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            passportNumber: true,
                            passportExpiry: true,
                            nationality: true,
                            dob: true,
                            photo: true,
                            _count: {
                                select: { applications: true }
                            }
                        }
                    }),
                    this.server.prisma.applicant.count({
                        where: { groupId: id, isActive: true }
                    })
                ]);
                const applicantPages = Math.ceil(applicantCount / appLimitNum);
                return reply.send({
                    group,
                    applicants,
                    applicantPagination: {
                        page: appPageNum,
                        limit: appLimitNum,
                        total: applicantCount,
                        pages: applicantPages,
                        hasMore: appPageNum < applicantPages
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
        // ==================== ADD NEW: GROUPBY CODE (for quick lookup) ====================
        // ADD: New method after getById
        this.getByCode = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const user = request.user;
                const { code } = request.params;
                const where = {
                    code: code.toUpperCase(),
                    organizationId: orgId
                };
                if (user.role === 'AGENCY_EMPLOYEE') {
                    where.assignedEmployeeId = user.id;
                }
                const group = await this.server.prisma.group.findFirst({
                    where,
                    include: {
                        assignedEmployee: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        },
                        _count: { select: { applicants: true } }
                    }
                });
                if (!group) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: `Group with code ${code} not found`
                    });
                }
                return reply.send(group);
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        // ==================== ADD NEW: GET APPLICANTS BY GROUP (lazy load) ====================
        // ADD: New method for lazy loading applicants
        this.getGroupApplicants = async (request, reply) => {
            try {
                const orgId = request.organizationId;
                const user = request.user;
                const { id } = request.params;
                const { page = '1', limit = '50', search = '', status = '' } = request.query;
                const pageNum = Math.max(1, parseInt(page));
                const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
                // Verify group exists and user has access
                const group = await this.server.prisma.group.findFirst({
                    where: {
                        id,
                        organizationId: orgId,
                        ...(user.role === 'AGENCY_EMPLOYEE' && { assignedEmployeeId: user.id })
                    },
                    select: { id: true }
                });
                if (!group) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Group not found'
                    });
                }
                const where = { groupId: id, isActive: true };
                // Search in name
                if (search && search.trim()) {
                    where.OR = [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { passportNumber: { contains: search, mode: 'insensitive' } }
                    ];
                }
                // Filter by application status
                if (status) {
                    where.applications = {
                        some: { status }
                    };
                }
                const [applicants, total] = await Promise.all([
                    this.server.prisma.applicant.findMany({
                        where,
                        orderBy: { lastName: 'asc' },
                        take: limitNum,
                        skip: (pageNum - 1) * limitNum,
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            passportNumber: true,
                            nationality: true,
                            dob: true,
                            photo: true,
                            applications: {
                                select: {
                                    id: true,
                                    status: true,
                                    createdAt: true
                                },
                                orderBy: { createdAt: 'desc' },
                                take: 1
                            },
                            _count: { select: { applications: true } }
                        }
                    }),
                    this.server.prisma.applicant.count({ where })
                ]);
                return reply.send({
                    data: applicants,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        pages: Math.ceil(total / limitNum)
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
        this.update = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can update groups'
                    });
                }
                const body = updateGroupSchema.parse(request.body);
                const existing = await this.server.prisma.group.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!existing) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Group not found'
                    });
                }
                // Validate assigned employee if provided
                if (body.assignedEmployeeId) {
                    const employee = await this.server.prisma.user.findFirst({
                        where: {
                            id: body.assignedEmployeeId,
                            organizationId: orgId,
                            isActive: true
                        }
                    });
                    if (!employee) {
                        return reply.status(400).send({
                            error: 'Bad Request',
                            message: 'Invalid employee ID'
                        });
                    }
                }
                const updateData = { ...body };
                if (body.travelDate === null) {
                    updateData.travelDate = null;
                }
                else if (body.travelDate) {
                    updateData.travelDate = new Date(body.travelDate);
                }
                const updated = await this.server.prisma.group.update({
                    where: { id },
                    data: updateData,
                    include: {
                        assignedEmployee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                });
                // Audit log
                await this.server.prisma.auditLog.create({
                    data: {
                        action: 'UPDATE_GROUP',
                        entityType: 'Group',
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
        this.assignEmployee = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                const { employeeId } = request.body;
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can assign employees'
                    });
                }
                const group = await this.server.prisma.group.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!group) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Group not found'
                    });
                }
                // Validate employee
                if (employeeId) {
                    const employee = await this.server.prisma.user.findFirst({
                        where: {
                            id: employeeId,
                            organizationId: orgId,
                            isActive: true
                        }
                    });
                    if (!employee) {
                        return reply.status(400).send({
                            error: 'Bad Request',
                            message: 'Invalid employee ID'
                        });
                    }
                }
                const updated = await this.server.prisma.group.update({
                    where: { id },
                    data: { assignedEmployeeId: employeeId },
                    include: {
                        assignedEmployee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                });
                return reply.send({
                    message: 'Employee assigned successfully',
                    group: updated
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.archive = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can archive groups'
                    });
                }
                const group = await this.server.prisma.group.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!group) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Group not found'
                    });
                }
                const updated = await this.server.prisma.group.update({
                    where: { id },
                    data: { isActive: false }
                });
                // Audit log
                await this.server.prisma.auditLog.create({
                    data: {
                        action: 'ARCHIVE_GROUP',
                        entityType: 'Group',
                        entityId: id,
                        oldValues: { isActive: true },
                        newValues: { isActive: false },
                        userId: user.id,
                        organizationId: orgId
                    }
                });
                return reply.send({
                    message: 'Group archived successfully',
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
                // Only admins can delete groups
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can delete groups'
                    });
                }
                const group = await this.server.prisma.group.findFirst({
                    where: { id, organizationId: orgId },
                    include: {
                        _count: {
                            select: { applicants: true }
                        }
                    }
                });
                if (!group) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'Group not found'
                    });
                }
                // Delete group and all associated data in transaction
                await this.server.prisma.$transaction(async (tx) => {
                    // Get all applicants in this group
                    const applicants = await tx.applicant.findMany({
                        where: { groupId: id, organizationId: orgId },
                        select: { id: true }
                    });
                    const applicantIds = applicants.map(a => a.id);
                    // Delete applications for all applicants in this group
                    if (applicantIds.length > 0) {
                        await tx.application.deleteMany({
                            where: {
                                applicantId: { in: applicantIds },
                                organizationId: orgId
                            }
                        });
                    }
                    // Delete all applicants in this group
                    await tx.applicant.deleteMany({
                        where: { groupId: id, organizationId: orgId }
                    });
                    // Delete the group
                    await tx.group.delete({
                        where: { id }
                    });
                    // Audit log
                    await tx.auditLog.create({
                        data: {
                            action: 'DELETE_GROUP',
                            entityType: 'Group',
                            entityId: id,
                            oldValues: {
                                code: group.code,
                                name: group.name,
                                applicantCount: group._count.applicants
                            },
                            userId: user.id,
                            organizationId: orgId
                        }
                    });
                });
                return reply.send({
                    message: 'Group and all associated data deleted successfully'
                });
            }
            catch (error) {
                console.error('Group delete error:', error);
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
    }
}
exports.GroupController = GroupController;
//# sourceMappingURL=group.controller.js.map