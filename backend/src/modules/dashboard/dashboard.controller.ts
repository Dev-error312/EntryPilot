import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export class DashboardController {
  constructor(private server: FastifyInstance) {}

  getStats = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;

      const groupWhere: any = { organizationId: orgId };
      const applicantWhere: any = { organizationId: orgId, isActive: true };
      const applicationWhere: any = { organizationId: orgId };

      // Employees can only see their assigned data
      if (user.role === 'AGENCY_EMPLOYEE') {
        groupWhere.assignedEmployeeId = user.id;
        applicantWhere.group = { assignedEmployeeId: user.id };
        applicationWhere.applicant = { group: { assignedEmployeeId: user.id } };
      }

      const [
        activeGroups,
        totalApplicants,
        pendingImports,
        applicationStats
      ] = await Promise.all([
        this.server.prisma.group.count({
          where: { ...groupWhere, isActive: true }
        }),
        this.server.prisma.applicant.count({
          where: applicantWhere
        }),
        this.server.prisma.import.count({
          where: { 
            organizationId: orgId,
            status: { in: ['PENDING', 'PROCESSING'] }
          }
        }),
        this.server.prisma.application.groupBy({
          by: ['status'],
          where: applicationWhere,
          _count: true
        })
      ]);

      const statusCounts = applicationStats.reduce((acc: any, curr) => {
        acc[curr.status.toLowerCase()] = curr._count;
        return acc;
      }, {});

      const totalApplications = applicationStats.reduce((sum, s) => sum + s._count, 0);

      return reply.send({
        activeGroups,
        totalApplicants,
        pendingImports,
        applications: {
          total: totalApplications,
          draft: statusCounts.draft || 0,
          review: statusCounts.review || 0,
          ready: statusCounts.ready || 0,
          submitted: statusCounts.submitted || 0,
          processing: statusCounts.processing || 0,
          approved: statusCounts.approved || 0,
          rejected: statusCounts.rejected || 0,
          delivered: statusCounts.delivered || 0
        }
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  getRecent = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { limit = 10 } = request.query as any;

      const where: any = { organizationId: orgId };

      // Employees can only see their assigned data
      if (user.role === 'AGENCY_EMPLOYEE') {
        where.applicant = { group: { assignedEmployeeId: user.id } };
      }

      const [recentApplications, recentApplicants, recentActivity] = await Promise.all([
        this.server.prisma.application.findMany({
          where,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            applicant: {
              select: {
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
        }),
        this.server.prisma.applicant.findMany({
          where: { 
            organizationId: orgId,
            isActive: true,
            ...(user.role === 'AGENCY_EMPLOYEE' 
              ? { group: { assignedEmployeeId: user.id } } 
              : {})
          },
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            group: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }),
        this.server.prisma.auditLog.findMany({
          where: {
            organizationId: orgId,
            ...(user.role === 'AGENCY_EMPLOYEE' 
              ? { userId: user.id } 
              : {})
          },
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        })
      ]);

      return reply.send({
        recentApplications,
        recentApplicants,
        recentActivity
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  getChartData = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const orgId = (request as any).organizationId;
      const { period = '30d' } = request.query as any;

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      const where: any = {
        organizationId: orgId,
        createdAt: { gte: startDate }
      };

      if (user.role === 'AGENCY_EMPLOYEE') {
        where.applicant = { group: { assignedEmployeeId: user.id } };
      }

      // Get applications by day
      const applications = await this.server.prisma.application.findMany({
        where,
        select: {
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: 'asc' }
      });

      // Group by date
      const dailyData: Record<string, any> = {};
      
      applications.forEach(app => {
        const date = app.createdAt.toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0
          };
        }
        dailyData[date].total++;
        
        if (['APPROVED', 'DELIVERED'].includes(app.status)) {
          dailyData[date].approved++;
        } else if (app.status === 'REJECTED') {
          dailyData[date].rejected++;
        } else {
          dailyData[date].pending++;
        }
      });

      // Fill in missing dates
      const chartData = [];
      const current = new Date(startDate);
      
      while (current <= now) {
        const dateStr = current.toISOString().split('T')[0];
        chartData.push(dailyData[dateStr] || {
          date: dateStr,
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0
        });
        current.setDate(current.getDate() + 1);
      }

      return reply.send(chartData);
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };

  getSuperAdminStats = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;

      if (user.role !== 'SUPER_ADMIN') {
        return reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Super admin only' 
        });
      }

      const [
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        totalApplicants,
        totalApplications,
        applicationStats
      ] = await Promise.all([
        this.server.prisma.organization.count(),
        this.server.prisma.organization.count({ where: { isActive: true } }),
        this.server.prisma.user.count(),
        this.server.prisma.applicant.count({ where: { isActive: true } }),
        this.server.prisma.application.count(),
        this.server.prisma.application.groupBy({
          by: ['status'],
          _count: true
        })
      ]);

      const statusCounts = applicationStats.reduce((acc: any, curr) => {
        acc[curr.status.toLowerCase()] = curr._count;
        return acc;
      }, {});

      // Recent organizations
      const recentOrgs = await this.server.prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              applicants: true,
              applications: true
            }
          }
        }
      });

      return reply.send({
        overview: {
          totalOrganizations,
          activeOrganizations,
          totalUsers,
          totalApplicants,
          totalApplications
        },
        applications: statusCounts,
        recentOrganizations: recentOrgs
      });
    } catch (error: any) {
      return reply.status(500).send({ 
        error: 'Server Error', 
        message: error.message 
      });
    }
  };
}
