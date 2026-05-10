import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const createApplicationSchema = z.object({
  applicantId: z.string().min(1),
  visaType: z.string().min(1),
  destinationCountry: z.string().min(1),
  templateId: z.string().optional(),
  notes: z.string().optional(),
  documents: z.any().optional()
});

const updateApplicationSchema = z.object({
  visaType: z.string().min(1).optional(),
  destinationCountry: z.string().optional(),
  templateId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  documents: z.any().optional()
});

const statusTransitions: Record<string, string[]> = {
  DRAFT: ['REVIEW'],
  REVIEW: ['READY', 'DRAFT'],
  READY: ['SUBMITTED', 'REVIEW'],
  SUBMITTED: ['PROCESSING'],
  PROCESSING: ['APPROVED', 'REJECTED'],
  REJECTED: ['DRAFT'],
  APPROVED: ['DELIVERED']
};

export class ApplicationController {
  constructor(private server: FastifyInstance) {}

  private generateReferenceNumber(): string {
    const prefix = 'VF';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;

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
        status,
        visaType,
        destinationCountry
      } = request.query as any;

      const where: any = { organizationId: orgId };

      if (status) where.status = status;
      if (visaType) where.visaType = visaType;
      if (destinationCountry) where.destinationCountry = destinationCountry;
      
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
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  listByStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = (request as any).organizationId;
      const user = (request as any).user;
      const { status } = request.params as any;

      const where: any = { organizationId: orgId, status };

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

  private async updateStatus(
    server: FastifyInstance,
    applicationId: string,
    newStatus: string,
    userId: string,
    orgId: string,
    extraData?: any
  ) {
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

    const updateData: any = { status: newStatus };

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

  submit = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      // Only admins can submit
      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can submit applications' 
        });
      }

      const updated = await this.updateStatus(
        this.server, id, 'SUBMITTED', user.id, orgId
      );

      return reply.send({ 
        message: 'Application submitted successfully',
        application: updated 
      });
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Bad Request', 
        message: error.message 
      });
    }
  };

  approve = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can approve applications' 
        });
      }

      const updated = await this.updateStatus(
        this.server, id, 'APPROVED', user.id, orgId
      );

      return reply.send({ 
        message: 'Application approved successfully',
        application: updated 
      });
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Bad Request', 
        message: error.message 
      });
    }
  };

  reject = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;
      const { reason } = request.body as any;

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

      const updated = await this.updateStatus(
        this.server, id, 'REJECTED', user.id, orgId, { reason }
      );

      return reply.send({ 
        message: 'Application rejected',
        application: updated 
      });
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Bad Request', 
        message: error.message 
      });
    }
  };

  deliver = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { id } = request.params as any;

      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can mark applications as delivered' 
        });
      }

      const updated = await this.updateStatus(
        this.server, id, 'DELIVERED', user.id, orgId
      );

      return reply.send({ 
        message: 'Application marked as delivered',
        application: updated 
      });
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Bad Request', 
        message: error.message 
      });
    }
  };
}
