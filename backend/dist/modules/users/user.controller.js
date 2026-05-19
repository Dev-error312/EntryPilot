"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const password_validator_1 = require("../../utils/password.validator");
const createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['AGENCY_ADMIN', 'AGENCY_EMPLOYEE']).default('AGENCY_EMPLOYEE')
});
const updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['AGENCY_ADMIN', 'AGENCY_EMPLOYEE']).optional()
});
class UserController {
    constructor(server) {
        this.server = server;
        this.create = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                // Only admins can create users
                if (user.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can create users'
                    });
                }
                const body = createUserSchema.parse(request.body);
                // Validate password strength
                const pwdValidation = (0, password_validator_1.validatePasswordStrength)(body.password);
                if (!pwdValidation.valid) {
                    return reply.status(400).send({ error: 'Validation Error', message: pwdValidation.errors.join('; ') });
                }
                // Check seat limit
                const org = await this.server.prisma.organization.findUnique({
                    where: { id: orgId }
                });
                if (org && org.usedSeats >= org.maxSeats) {
                    return reply.status(400).send({
                        error: 'Seat Limit Reached',
                        message: 'Organization has reached maximum user limit'
                    });
                }
                // Check if email exists
                const existing = await this.server.prisma.user.findUnique({
                    where: { email: body.email.toLowerCase() }
                });
                if (existing) {
                    return reply.status(409).send({
                        error: 'Conflict',
                        message: 'Email already exists'
                    });
                }
                const hashedPassword = await bcryptjs_1.default.hash(body.password, 10);
                const newUser = await this.server.prisma.$transaction(async (tx) => {
                    const created = await tx.user.create({
                        data: {
                            email: body.email.toLowerCase(),
                            password: hashedPassword,
                            firstName: body.firstName,
                            lastName: body.lastName,
                            phone: body.phone,
                            role: body.role,
                            organizationId: orgId
                        }
                    });
                    // Update seat count
                    await tx.organization.update({
                        where: { id: orgId },
                        data: { usedSeats: { increment: 1 } }
                    });
                    // Audit log
                    await tx.auditLog.create({
                        data: {
                            action: 'CREATE_USER',
                            entityType: 'User',
                            entityId: created.id,
                            newValues: { email: created.email, role: created.role },
                            userId: user.id,
                            organizationId: orgId
                        }
                    });
                    return created;
                });
                return reply.status(201).send({
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    isActive: newUser.isActive
                });
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
                const { page = 1, limit = 20, search, role, isActive } = request.query;
                const where = { organizationId: orgId };
                if (search) {
                    where.OR = [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ];
                }
                if (role)
                    where.role = role;
                if (isActive !== undefined)
                    where.isActive = isActive === 'true';
                const [users, total] = await Promise.all([
                    this.server.prisma.user.findMany({
                        where,
                        skip: (page - 1) * limit,
                        take: parseInt(limit),
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                            phone: true,
                            avatar: true,
                            isActive: true,
                            lastLogin: true,
                            createdAt: true,
                            _count: {
                                select: { assignedGroups: true }
                            }
                        }
                    }),
                    this.server.prisma.user.count({ where })
                ]);
                return reply.send({
                    data: users,
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
                const user = await this.server.prisma.user.findFirst({
                    where: { id, organizationId: orgId },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        phone: true,
                        avatar: true,
                        isActive: true,
                        lastLogin: true,
                        createdAt: true,
                        assignedGroups: {
                            where: { isActive: true },
                            select: {
                                id: true,
                                code: true,
                                name: true
                            }
                        }
                    }
                });
                if (!user) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'User not found'
                    });
                }
                return reply.send(user);
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
                const currentUser = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                if (currentUser.role === 'AGENCY_EMPLOYEE' && currentUser.id !== id) {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Cannot update other users'
                    });
                }
                const body = updateUserSchema.parse(request.body);
                const existing = await this.server.prisma.user.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!existing) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'User not found'
                    });
                }
                const updated = await this.server.prisma.user.update({
                    where: { id },
                    data: body
                });
                // Audit log
                await this.server.prisma.auditLog.create({
                    data: {
                        action: 'UPDATE_USER',
                        entityType: 'User',
                        entityId: id,
                        oldValues: existing,
                        newValues: body,
                        userId: currentUser.id,
                        organizationId: orgId
                    }
                });
                return reply.send({
                    id: updated.id,
                    email: updated.email,
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    role: updated.role,
                    isActive: updated.isActive
                });
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
                const currentUser = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                if (currentUser.role !== 'AGENCY_ADMIN') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can deactivate users'
                    });
                }
                if (currentUser.id === id) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Cannot deactivate yourself'
                    });
                }
                const user = await this.server.prisma.user.findFirst({
                    where: { id, organizationId: orgId }
                });
                if (!user) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'User not found'
                    });
                }
                const updated = await this.server.prisma.user.update({
                    where: { id },
                    data: { isActive: !user.isActive }
                });
                // Update seat count
                await this.server.prisma.organization.update({
                    where: { id: orgId },
                    data: { usedSeats: { increment: updated.isActive ? 1 : -1 } }
                });
                return reply.send({
                    message: `User ${updated.isActive ? 'activated' : 'deactivated'}`,
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
                const currentUser = request.user;
                const orgId = request.organizationId;
                const { id } = request.params;
                if (currentUser.role === 'AGENCY_EMPLOYEE') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Only admins can delete users'
                    });
                }
                if (currentUser.id === id) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Cannot delete yourself'
                    });
                }
                const user = await this.server.prisma.user.findFirst({
                    where: {
                        id,
                        ...(currentUser.role === 'SUPER_ADMIN' ? {} : { organizationId: orgId })
                    }
                });
                if (!user) {
                    return reply.status(404).send({
                        error: 'Not Found',
                        message: 'User not found'
                    });
                }
                // Soft delete - just mark as inactive
                const deleted = await this.server.prisma.user.update({
                    where: { id },
                    data: { isActive: false }
                });
                // Update seat count
                if (user.organizationId) {
                    await this.server.prisma.organization.update({
                        where: { id: user.organizationId },
                        data: { usedSeats: { decrement: 1 } }
                    });
                }
                // Audit log
                if (user.organizationId) {
                    await this.server.prisma.auditLog.create({
                        data: {
                            action: 'DELETE_USER',
                            entityType: 'User',
                            entityId: id,
                            oldValues: { email: user.email },
                            userId: currentUser.id,
                            organizationId: user.organizationId
                        }
                    });
                }
                return reply.send({
                    message: 'User deleted successfully'
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
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map