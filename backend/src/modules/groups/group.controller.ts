import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const createGroupSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(2),
  travelDate: z.string().datetime().optional(),
  externalAgent: z.string().optional(),
  notes: z.string().optional(),
  assignedEmployeeId: z.string().optional()
});

const updateGroupSchema = z.object({
  name: z.string().min(2).optional(),
  travelDate: z.string().datetime().optional().nullable(),
  externalAgent: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assignedEmployeeId: z.string().optional().nullable()
});

export class GroupController {
  constructor(private server: FastifyInstance) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;

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
        const created = await tx.group.create({
          data: {
            code: body.code.toUpperCase(),
            name: body.name,
            travelDate: body.travelDate ? new Date(body.travelDate) : null,
            externalAgent: body.externalAgent,
            notes: body.notes,
            assignedEmployeeId: body.assignedEmployeeId,
            organizationId: orgId
          },
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
      const user = (request as any).user;
      const { 
        page = 1, 
        limit = 20, 
        search, 
        isActive, 
        assignedEmployeeId 
      } = request.query as any;

      const where: any = { organizationId: orgId };

      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (assignedEmployeeId) where.assignedEmployeeId = assignedEmployeeId;

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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  listActive = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const user = (request as any).user;

      const where: any = { 
        organizationId: orgId,
        isActive: true 
      };

      if (user.role === 'AGENCY_EMPLOYEE') {
        where.assignedEmployeeId = user.id;
      }

      const groups = await this.server.prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          code: true,
          name: true,
          travelDate: true,
          _count: {
            select: { applicants: true }
          }
        }
      });

      return reply.send(groups);
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
      const user = (request as any).user;
      const { id } = request.params as any;

      const where: any = { id, organizationId: orgId };

      if (user.role === 'AGENCY_EMPLOYEE') {
        where.assignedEmployeeId = user.id;
      }

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
          applicants: {
            where: { isActive: true },
            orderBy: { lastName: 'asc' },
            include: {
              _count: {
                select: { applications: true }
              }
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

      return reply.send(group);
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

      const updateData: any = { ...body };
      if (body.travelDate === null) {
        updateData.travelDate = null;
      } else if (body.travelDate) {
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

  assignEmployee = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;
      const { employeeId } = request.body as any;

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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  archive = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };
}
