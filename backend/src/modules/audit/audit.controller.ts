import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export class AuditController {
  constructor(private server: FastifyInstance) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { 
        page = 1, 
        limit = 50, 
        action,
        entityType,
        startDate,
        endDate
      } = request.query as any;

      // Employees cannot view audit logs
      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can view audit logs' 
        });
      }

      const where: any = { organizationId: orgId };

      if (action) where.action = { contains: action, mode: 'insensitive' };
      if (entityType) where.entityType = entityType;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [logs, total] = await Promise.all([
        this.server.prisma.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),
        this.server.prisma.auditLog.count({ where })
      ]);

      return reply.send({
        data: logs,
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

  listByEntity = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { type, id } = request.params as any;

      // Employees cannot view audit logs
      if (user.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can view audit logs' 
        });
      }

      const logs = await this.server.prisma.auditLog.findMany({
        where: {
          organizationId: orgId,
          entityType: type,
          entityId: id
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return reply.send(logs);
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  listByUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const currentUser = (request as any).user;
      const orgId = (request as any).organizationId;
      const { userId } = request.params as any;
      const { page = 1, limit = 50 } = request.query as any;

      // Employees cannot view audit logs
      if (currentUser.role === 'AGENCY_EMPLOYEE') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Only admins can view audit logs' 
        });
      }

      const [logs, total] = await Promise.all([
        this.server.prisma.auditLog.findMany({
          where: {
            organizationId: orgId,
            userId
          },
          skip: (page - 1) * limit,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        this.server.prisma.auditLog.count({
          where: {
            organizationId: orgId,
            userId
          }
        })
      ]);

      return reply.send({
        data: logs,
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
}
