import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const createApplicantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  dob: z.string().datetime().optional().nullable(),
  gender: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  passportNumber: z.string().min(1, 'Passport number must be at least 1 character').optional().nullable(),
  passportExpiry: z.string().datetime().optional().nullable(),
  passportIssue: z.string().datetime().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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
  passportNumber: z.string().min(1).optional().nullable(),
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

  /**
   * Helper: Check if passport number already exists in organization
   * Exclude current applicant ID if updating
   */
  private async checkDuplicatePassport(
    passportNumber: string,
    organizationId: string,
    excludeApplicantId?: string
  ): Promise<boolean> {
    if (!passportNumber) return false; // Passport optional

    const where: any = {
      passportNumber: { equals: passportNumber, mode: 'insensitive' },
      organizationId,
      isActive: true
    };

    if (excludeApplicantId) {
      where.id = { not: excludeApplicantId };
    }

    const existing = await this.server.prisma.applicant.findFirst({ where });
    return !!existing;
  }

  /**
   * Helper: Check if email already exists in organization
   * Exclude current applicant ID if updating
   */
  private async checkDuplicateEmail(
    email: string,
    organizationId: string,
    excludeApplicantId?: string
  ): Promise<boolean> {
    if (!email) return false; // Email optional

    const where: any = {
      email: { equals: email, mode: 'insensitive' },
      organizationId,
      isActive: true
    };

    if (excludeApplicantId) {
      where.id = { not: excludeApplicantId };
    }

    const existing = await this.server.prisma.applicant.findFirst({ where });
    return !!existing;
  }

  /**
   * Helper: Handle Prisma errors
   */
  private handlePrismaError(error: any, reply: FastifyReply) {
    // P2002: Unique constraint failed
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return reply.status(409).send({
        error: 'Conflict',
        message: `${field} already exists`
      });
    }

    console.error('Database error:', error);
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Database operation failed'
    });
  }

  /**
   * CREATE: Create new applicant
   */
  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;

      const body = createApplicantSchema.parse(request.body);

      // Validate group belongs to organization and is active
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

      // Check for duplicate passport number
      if (body.passportNumber) {
        const isDuplicate = await this.checkDuplicatePassport(
          body.passportNumber,
          orgId
        );
        if (isDuplicate) {
          return reply.status(409).send({
            error: 'Conflict',
            message: `An applicant with passport number "${body.passportNumber}" already exists in your organization`
          });
        }
      }

      // Check for duplicate email
      if (body.email) {
        const isDuplicate = await this.checkDuplicateEmail(body.email, orgId);
        if (isDuplicate) {
          return reply.status(409).send({
            error: 'Conflict',
            message: 'Email already exists in your organization'
          });
        }
      }

      const applicant = await this.server.prisma.$transaction(async (tx) => {
        const created = await tx.applicant.create({
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email || null,
            phone: body.phone || null,
            dob: body.dob ? new Date(body.dob) : null,
            gender: body.gender || null,
            nationality: body.nationality || null,
            passportNumber: body.passportNumber || null,
            passportExpiry: body.passportExpiry ? new Date(body.passportExpiry) : null,
            passportIssue: body.passportIssue ? new Date(body.passportIssue) : null,
            address: body.address || null,
            city: body.city || null,
            country: body.country || null,
            notes: body.notes || null,
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
              passport: created.passportNumber,
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
      return this.handlePrismaError(error, reply);
    }
  };

  /**
   * LIST: List applicants with filtering and pagination
   */
  list = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const user = (request as any).user;
      const {
        page = '1',
        limit = '20',
        search,
        groupId,
        passportNumber,
        status,
        nationality,
        isActive = 'true'
      } = request.query as any;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

      const where: any = { organizationId: orgId };

      // Filters
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (groupId) where.groupId = groupId;
      if (nationality) where.nationality = nationality;

      // Search by name, email, or passport
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { passportNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Filter by exact passport number
      if (passportNumber) {
        where.passportNumber = {
          equals: passportNumber,
          mode: 'insensitive'
        };
      }

      // Filter by application status
      if (status) {
        where.applications = {
          some: { status }
        };
      }

      // Employees can only see applicants from their assigned groups
      if (user.role === 'AGENCY_EMPLOYEE') {
        where.group = { assignedEmployeeId: user.id };
      }

      const [applicants, total] = await Promise.all([
        this.server.prisma.applicant.findMany({
          where,
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          orderBy: { lastName: 'asc' },
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
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      return this.handlePrismaError(error, reply);
    }
  };

  /**
   * LIST GROUPED: List applicants grouped by group with filters and pagination
   */
  listGrouped = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const user = (request as any).user;
      const {
        page = '1',
        limit = '10',
        groupCode,
        groupName,
        isActive = 'true'
      } = request.query as any;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

      const groupWhere: any = {
        organizationId: orgId,
        isActive: true
      };

      // Filter by group code (exact or partial)
      if (groupCode) {
        groupWhere.code = { contains: groupCode, mode: 'insensitive' };
      }

      // Filter by group name (exact or partial)
      if (groupName) {
        groupWhere.name = { contains: groupName, mode: 'insensitive' };
      }

      // Employees can only see their assigned groups
      if (user.role === 'AGENCY_EMPLOYEE') {
        groupWhere.assignedEmployeeId = user.id;
      }

      // Get total groups for pagination
      const totalGroups = await this.server.prisma.group.count({
        where: groupWhere
      });

      const groups = await this.server.prisma.group.findMany({
        where: groupWhere,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { code: 'asc' },
        include: {
          applicants: {
            where: { isActive: isActive === 'true' ? true : false },
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

      return reply.send({
        data: groups,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalGroups,
          totalPages: Math.ceil(totalGroups / limitNum)
        }
      });
    } catch (error: any) {
      return this.handlePrismaError(error, reply);
    }
  };

  /**
   * LIST BY GROUP: List applicants in specific group
   */
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
            orderBy: { createdAt: 'desc' },
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
        applicants,
        count: applicants.length
      });
    } catch (error: any) {
      return this.handlePrismaError(error, reply);
    }
  };

  /**
   * GET BY ID: Get single applicant with full details
   */
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
                  name: true,
                  visaType: true
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
      return this.handlePrismaError(error, reply);
    }
  };

  /**
   * UPDATE: Update applicant details
   */
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

        // Employees cannot move applicants to other groups
        if (user.role === 'AGENCY_EMPLOYEE' &&
          newGroup.assignedEmployeeId !== user.id) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Cannot move applicant to another group'
          });
        }
      }

      // Check for duplicate passport (if changing and different from current)
      if (body.passportNumber &&
        body.passportNumber.toLowerCase() !== existing.passportNumber?.toLowerCase()) {
        const isDuplicate = await this.checkDuplicatePassport(
          body.passportNumber,
          orgId,
          id
        );
        if (isDuplicate) {
          return reply.status(409).send({
            error: 'Conflict',
            message: `An applicant with passport number "${body.passportNumber}" already exists in your organization`
          });
        }
      }

      // Check for duplicate email (if changing and different from current)
      if (body.email &&
        body.email.toLowerCase() !== existing.email?.toLowerCase()) {
        const isDuplicate = await this.checkDuplicateEmail(
          body.email,
          orgId,
          id
        );
        if (isDuplicate) {
          return reply.status(409).send({
            error: 'Conflict',
            message: 'Email already exists in your organization'
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
          oldValues: {
            firstName: existing.firstName,
            lastName: existing.lastName,
            passport: existing.passportNumber
          },
          newValues: {
            firstName: updated.firstName,
            lastName: updated.lastName,
            passport: updated.passportNumber
          },
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
      return this.handlePrismaError(error, reply);
    }
  };

  /**
   * SOFT DELETE: Mark applicant as inactive
   */
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
      return this.handlePrismaError(error, reply);
    }
  };
}
