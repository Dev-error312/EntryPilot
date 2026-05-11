import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const createApplicantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  dob: z.string().datetime().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().datetime().optional(),
  passportIssue: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  groupId: z.string().min(1, 'Group is required'),
  documents: z.any().optional()
});

const updateApplicantSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  dob: z.string().datetime().optional().nullable(),
  gender: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  passportExpiry: z.string().datetime().optional().nullable(),
  passportIssue: z.string().datetime().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  groupId: z.string().optional(),
  documents: z.any().optional()
});

export class ApplicantController {
  constructor(private server: FastifyInstance) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;

      const body = createApplicantSchema.parse(request.body);

      // Validate group belongs to organization
      const group = await this.server.prisma.group.findFirst({
        where: { 
          id: body.groupId, 
          organizationId: orgId,
          isActive: true
        }
      });

      if (!group) {
        return reply.status(400).send({ 
          error: 'Bad Request', 
          message: 'Invalid group ID' 
        });
      }

      // Employees can only add to their assigned groups
      if (user.role === 'AGENCY_EMPLOYEE' && group.assignedEmployeeId !== user.id) {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'You can only add applicants to your assigned groups' 
        });
      }

      const applicant = await this.server.prisma.$transaction(async (tx) => {
        const created = await tx.applicant.create({
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            dob: body.dob ? new Date(body.dob) : null,
            gender: body.gender,
            nationality: body.nationality,
            passportNumber: body.passportNumber,
            passportExpiry: body.passportExpiry ? new Date(body.passportExpiry) : null,
            passportIssue: body.passportIssue ? new Date(body.passportIssue) : null,
            address: body.address,
            city: body.city,
            country: body.country,
            notes: body.notes,
            documents: body.documents,
            groupId: body.groupId,
            organizationId: orgId
          },
          include: {
            group: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            action: 'CREATE_APPLICANT',
            entityType: 'Applicant',
            entityId: created.id,
            newValues: { 
              name: `${created.firstName} ${created.lastName}`,
              group: group.code 
            },
            userId: user.id,
            organizationId: orgId
          }
        });

        return created;
      });

      return reply.status(201).send(applicant);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return reply.status(400).send({ 
          error: 'Validation Error', 
          message: messages,
          details: error.errors 
        });
      }
      console.error('Applicant creation error:', error);
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
        groupId,
        nationality,
        isActive = 'true'
      } = request.query as any;

      const where: any = { organizationId: orgId };

      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (groupId) where.groupId = groupId;
      if (nationality) where.nationality = nationality;
      
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { passportNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Employees can only see applicants from their assigned groups
      if (user.role === 'AGENCY_EMPLOYEE') {
        where.group = { assignedEmployeeId: user.id };
      }

      const [applicants, total] = await Promise.all([
        this.server.prisma.applicant.findMany({
          where,
          skip: (page - 1) * limit,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            group: {
              select: {
                id: true,
                code: true,
                name: true
              }
            },
            _count: {
              select: { applications: true }
            }
          }
        }),
        this.server.prisma.applicant.count({ where })
      ]);

      return reply.send({
        data: applicants,
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

  listGrouped = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const user = (request as any).user;

      const groupWhere: any = { 
        organizationId: orgId,
        isActive: true 
      };

      if (user.role === 'AGENCY_EMPLOYEE') {
        groupWhere.assignedEmployeeId = user.id;
      }

      const groups = await this.server.prisma.group.findMany({
        where: groupWhere,
        orderBy: { code: 'asc' },
        include: {
          applicants: {
            where: { isActive: true },
            orderBy: { lastName: 'asc' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              passportNumber: true,
              nationality: true,
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

      return reply.send(groups);
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  listByGroup = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const user = (request as any).user;
      const { groupId } = request.params as any;

      const groupWhere: any = { 
        id: groupId,
        organizationId: orgId 
      };

      if (user.role === 'AGENCY_EMPLOYEE') {
        groupWhere.assignedEmployeeId = user.id;
      }

      const group = await this.server.prisma.group.findFirst({
        where: groupWhere,
        include: {
          assignedEmployee: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!group) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Group not found' 
        });
      }

      const applicants = await this.server.prisma.applicant.findMany({
        where: { 
          groupId,
          organizationId: orgId,
          isActive: true 
        },
        orderBy: { lastName: 'asc' },
        include: {
          applications: {
            select: {
              id: true,
              referenceNumber: true,
              status: true,
              visaType: true,
              destinationCountry: true
            }
          }
        }
      });

      return reply.send({
        group,
        applicants
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
      const user = (request as any).user;
      const { id } = request.params as any;

      const applicant = await this.server.prisma.applicant.findFirst({
        where: { id, organizationId: orgId },
        include: {
          group: {
            select: {
              id: true,
              code: true,
              name: true,
              assignedEmployeeId: true
            }
          },
          applications: {
            orderBy: { createdAt: 'desc' },
            include: {
              template: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!applicant) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Applicant not found' 
        });
      }

      // Employees can only view applicants from their assigned groups
      if (user.role === 'AGENCY_EMPLOYEE' && 
          applicant.group.assignedEmployeeId !== user.id) {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Access denied' 
        });
      }

      return reply.send(applicant);
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

      const body = updateApplicantSchema.parse(request.body);

      const existing = await this.server.prisma.applicant.findFirst({
        where: { id, organizationId: orgId },
        include: { group: true }
      });

      if (!existing) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Applicant not found' 
        });
      }

      // Employees can only update applicants from their assigned groups
      if (user.role === 'AGENCY_EMPLOYEE' && 
          existing.group.assignedEmployeeId !== user.id) {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Access denied' 
        });
      }

      // Validate new group if changing
      if (body.groupId && body.groupId !== existing.groupId) {
        const newGroup = await this.server.prisma.group.findFirst({
          where: { 
            id: body.groupId, 
            organizationId: orgId,
            isActive: true
          }
        });

        if (!newGroup) {
          return reply.status(400).send({ 
            error: 'Bad Request', 
            message: 'Invalid group ID' 
          });
        }
      }

      const updateData: any = { ...body };
      if (body.dob) updateData.dob = new Date(body.dob);
      if (body.passportExpiry) updateData.passportExpiry = new Date(body.passportExpiry);
      if (body.passportIssue) updateData.passportIssue = new Date(body.passportIssue);

      const updated = await this.server.prisma.applicant.update({
        where: { id },
        data: updateData,
        include: {
          group: {
            select: {
              id: true,
              code: true,
              name: true
            }
          }
        }
      });

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: 'UPDATE_APPLICANT',
          entityType: 'Applicant',
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

  softDelete = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can delete applicants' 
        });
      }

      const applicant = await this.server.prisma.applicant.findFirst({
        where: { id, organizationId: orgId }
      });

      if (!applicant) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Applicant not found' 
        });
      }

      // Check for active applications
      const activeApps = await this.server.prisma.application.count({
        where: { 
          applicantId: id,
          status: { notIn: ['DRAFT', 'REJECTED', 'DELIVERED'] }
        }
      });

      if (activeApps > 0) {
        return reply.status(400).send({ 
          error: 'Bad Request', 
          message: 'Cannot delete applicant with active applications' 
        });
      }

      await this.server.prisma.applicant.update({
        where: { id },
        data: { isActive: false }
      });

      // Audit log
      await this.server.prisma.auditLog.create({
        data: {
          action: 'DELETE_APPLICANT',
          entityType: 'Applicant',
          entityId: id,
          oldValues: { isActive: true },
          newValues: { isActive: false },
          userId: user.id,
          organizationId: orgId
        }
      });

      return reply.send({ message: 'Applicant deleted successfully' });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };
}
