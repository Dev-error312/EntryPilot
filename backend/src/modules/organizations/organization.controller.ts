import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10).toUpperCase(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  maxSeats: z.number().min(1).default(10),
  adminEmail: z.string().email(),
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1),
  adminPassword: z.string().min(6)
});

const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  maxSeats: z.number().min(1).optional()
});

export class OrganizationController {
  constructor(private server: FastifyInstance) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      // Only super admins can create organizations
      if (user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only super admins can create organizations' 
        });
      }

      const body = createOrgSchema.parse(request.body);

      // Check if code or email already exists
      const existing = await this.server.prisma.organization.findFirst({
        where: {
          OR: [
            { code: body.code },
            { email: body.email }
          ]
        }
      });

      if (existing) {
        return reply.status(409).send({ 
          error: 'Conflict', 
          message: 'Organization code or email already exists' 
        });
      }

      // Create organization and admin user in transaction
      const result = await this.server.prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: body.name,
            code: body.code,
            email: body.email,
            phone: body.phone,
            address: body.address,
            maxSeats: body.maxSeats,
            usedSeats: 1 // Admin counts as first seat
          }
        });

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(body.adminPassword, 10);

        const admin = await tx.user.create({
          data: {
            email: body.adminEmail.toLowerCase(),
            password: hashedPassword,
            firstName: body.adminFirstName,
            lastName: body.adminLastName,
            role: 'AGENCY_ADMIN',
            organizationId: org.id
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            action: 'CREATE_ORGANIZATION',
            entityType: 'Organization',
            entityId: org.id,
            newValues: { name: org.name, code: org.code },
            userId: user.id,
            organizationId: org.id
          }
        });

        return { organization: org, admin };
      });

      return reply.status(201).send({
        message: 'Organization created successfully',
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          code: result.organization.code,
          email: result.organization.email
        },
        admin: {
          id: result.admin.id,
          email: result.admin.email,
          firstName: result.admin.firstName,
          lastName: result.admin.lastName
        }
      });
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
      const user = (request as any).user;
      const { page = 1, limit = 20, search, isActive } = request.query as any;

      const where: any = {};

      // Non-super admins can only see their own organization
      if (user.role !== 'SUPER_ADMIN') {
        where.id = user.organizationId;
      } else {
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ];
        }
        if (isActive !== undefined) {
          where.isActive = isActive === 'true';
        }
      }

      const [organizations, total] = await Promise.all([
        this.server.prisma.organization.findMany({
          where,
          skip: (page - 1) * limit,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                users: true,
                groups: true,
                applicants: true,
                applications: true
              }
            }
          }
        }),
        this.server.prisma.organization.count({ where })
      ]);

      return reply.send({
        data: organizations,
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
      const user = (request as any).user;
      const { id } = request.params as any;

      // Check access
      if (user.role !== 'SUPER_ADMIN' && user.organizationId !== id) {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Access denied' 
        });
      }

      const organization = await this.server.prisma.organization.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              groups: true,
              applicants: true,
              applications: true
            }
          }
        }
      });

      if (!organization) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Organization not found' 
        });
      }

      return reply.send(organization);
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
      const { id } = request.params as any;

      // Only super admins or org admins can update
      if (user.role !== 'SUPER_ADMIN' && 
          !(user.role === 'AGENCY_ADMIN' && user.organizationId === id)) {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Access denied' 
        });
      }

      const body = updateOrgSchema.parse(request.body);

      const oldOrg = await this.server.prisma.organization.findUnique({
        where: { id }
      });

      if (!oldOrg) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Organization not found' 
        });
      }

      const organization = await this.server.prisma.organization.update({
        where: { id },
        data: body
      });

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: 'UPDATE_ORGANIZATION',
          entityType: 'Organization',
          entityId: id,
          oldValues: oldOrg,
          newValues: body,
          userId: user.id,
          organizationId: id
        }
      });

      return reply.send(organization);
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
      
      if (user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only super admins can toggle organization status' 
        });
      }

      const { id } = request.params as any;

      const org = await this.server.prisma.organization.findUnique({
        where: { id }
      });

      if (!org) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Organization not found' 
        });
      }

      const updated = await this.server.prisma.organization.update({
        where: { id },
        data: { isActive: !org.isActive }
      });

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: org.isActive ? 'DEACTIVATE_ORGANIZATION' : 'ACTIVATE_ORGANIZATION',
          entityType: 'Organization',
          entityId: id,
          oldValues: { isActive: org.isActive },
          newValues: { isActive: updated.isActive },
          userId: user.id,
          organizationId: id
        }
      });

      return reply.send({ 
        message: `Organization ${updated.isActive ? 'activated' : 'deactivated'}`,
        isActive: updated.isActive 
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  getStats = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const { id } = request.params as any;

      if (user.role !== 'SUPER_ADMIN' && user.organizationId !== id) {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Access denied' 
        });
      }

      const [
        totalUsers,
        activeGroups,
        totalApplicants,
        applicationStats
      ] = await Promise.all([
        this.server.prisma.user.count({ 
          where: { organizationId: id, isActive: true } 
        }),
        this.server.prisma.group.count({ 
          where: { organizationId: id, isActive: true } 
        }),
        this.server.prisma.applicant.count({ 
          where: { organizationId: id } 
        }),
        this.server.prisma.application.groupBy({
          by: ['status'],
          where: { organizationId: id },
          _count: true
        })
      ]);

      const statusCounts = applicationStats.reduce((acc: any, curr) => {
        acc[curr.status.toLowerCase()] = curr._count;
        return acc;
      }, {});

      return reply.send({
        totalUsers,
        activeGroups,
        totalApplicants,
        applications: {
          total: applicationStats.reduce((sum, s) => sum + s._count, 0),
          ...statusCounts
        }
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
      
      if (user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only super admins can delete organizations' 
        });
      }

      const { id } = request.params as any;

      const org = await this.server.prisma.organization.findUnique({
        where: { id }
      });

      if (!org) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Organization not found' 
        });
      }

      // Soft delete - just mark as inactive and clear data
      const deleted = await this.server.prisma.organization.update({
        where: { id },
        data: { isActive: false }
      });

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: 'DELETE_ORGANIZATION',
          entityType: 'Organization',
          entityId: id,
          oldValues: { name: org.name },
          userId: user.id,
          organizationId: id
        }
      });

      return reply.send({ 
        message: 'Organization deleted successfully'
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };
}
