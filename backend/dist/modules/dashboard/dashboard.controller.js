"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
class DashboardController {
    constructor(server) {
        this.server = server;
        this.getStats = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const groupWhere = { organizationId: orgId };
                const applicantWhere = { organizationId: orgId, isActive: true };
                const applicationWhere = { organizationId: orgId };
                const importWhere = { organizationId: orgId };
                // Employees can only see their assigned data
                if (user.role === 'AGENCY_EMPLOYEE') {
                    groupWhere.assignedEmployeeId = user.id;
                    applicantWhere.group = { assignedEmployeeId: user.id };
                    applicationWhere.applicant = { group: { assignedEmployeeId: user.id } };
                    importWhere.group = { assignedEmployeeId: user.id };
                }
                // Run all queries in parallel
                const [activeGroups, totalApplicants, applicationStats, queueStats, ocrStats, processingTimes] = await Promise.all([
                    // Active groups count
                    this.server.prisma.group.count({
                        where: { ...groupWhere, isActive: true }
                    }),
                    // Total applicants
                    this.server.prisma.applicant.count({
                        where: applicantWhere
                    }),
                    // Application status breakdown
                    this.server.prisma.application.groupBy({
                        by: ['status'],
                        where: applicationWhere,
                        _count: true
                    }),
                    // Processing queue stats (in review + processing)
                    this.server.prisma.application.groupBy({
                        by: ['status'],
                        where: { ...applicationWhere, status: { in: ['REVIEW', 'PROCESSING'] } },
                        _count: true
                    }),
                    // OCR/Import success rate
                    this.server.prisma.import.groupBy({
                        by: ['status'],
                        where: importWhere,
                        _count: true
                    }),
                    // Processing summary (count only) - avg on DateTime not supported by Prisma _avg
                    this.server.prisma.application.aggregate({
                        where: { ...applicationWhere, status: { in: ['APPROVED', 'REJECTED'] } },
                        _count: true
                    })
                ]);
                // Process application status counts
                const statusCounts = applicationStats.reduce((acc, curr) => {
                    acc[curr.status.toLowerCase()] = curr._count;
                    return acc;
                }, {});
                const totalApplications = applicationStats.reduce((sum, s) => sum + s._count, 0);
                // Calculate visa completion rate
                const completedVisas = (statusCounts.approved || 0) + (statusCounts.delivered || 0);
                const completionRate = totalApplications > 0
                    ? Math.round((completedVisas / totalApplications) * 100)
                    : 0;
                // Calculate OCR/Import success rate
                const totalImports = ocrStats.reduce((sum, s) => sum + s._count, 0);
                const completedImports = ocrStats.find(s => s.status === 'COMPLETED')?._count || 0;
                const failedImports = ocrStats.find(s => s.status === 'FAILED')?._count || 0;
                const ocrSuccessRate = totalImports > 0
                    ? Math.round((completedImports / totalImports) * 100)
                    : 0;
                // Queue stats
                const queueCount = queueStats.reduce((sum, s) => sum + s._count, 0);
                const inReview = queueStats.find(s => s.status === 'REVIEW')?._count || 0;
                const inProcessing = queueStats.find(s => s.status === 'PROCESSING')?._count || 0;
                return reply.send({
                    // Overview metrics
                    overview: {
                        activeGroups,
                        totalApplicants,
                        totalApplications,
                        completionRate,
                        ocrSuccessRate
                    },
                    // Application status breakdown
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
                    },
                    // Processing queue
                    queue: {
                        total: queueCount,
                        inReview,
                        inProcessing
                    },
                    // OCR/Import metrics
                    imports: {
                        total: totalImports,
                        completed: completedImports,
                        failed: failedImports,
                        pending: totalImports - completedImports - failedImports,
                        successRate: ocrSuccessRate
                    },
                    // Visa completion
                    visas: {
                        total: totalApplications,
                        completed: completedVisas,
                        pending: totalApplications - completedVisas,
                        rate: completionRate
                    },
                    // Timestamps
                    generatedAt: new Date().toISOString()
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        // ==================== ADD MISSING METRICS - processing trends & insights ====================
        this.getStatsByPeriod = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { period = 'month', limit = '12' } = request.query;
                // Calculate date range based on period
                const now = new Date();
                const limitNum = Math.min(24, Math.max(1, parseInt(limit)));
                let startDate = new Date();
                if (period === 'day') {
                    startDate.setDate(startDate.getDate() - limitNum);
                }
                else if (period === 'week') {
                    startDate.setDate(startDate.getDate() - (limitNum * 7));
                }
                else {
                    // default to month
                    startDate.setMonth(startDate.getMonth() - limitNum);
                }
                const applicationWhere = {
                    organizationId: orgId,
                    createdAt: { gte: startDate, lte: now }
                };
                if (user.role === 'AGENCY_EMPLOYEE') {
                    applicationWhere.applicant = { group: { assignedEmployeeId: user.id } };
                }
                // Get applications grouped by date
                const applications = await this.server.prisma.application.findMany({
                    where: applicationWhere,
                    select: {
                        createdAt: true,
                        status: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
                // Group by period
                const grouped = {};
                applications.forEach(app => {
                    let key;
                    if (period === 'day') {
                        key = app.createdAt.toISOString().split('T')[0];
                    }
                    else if (period === 'week') {
                        const weekStart = new Date(app.createdAt);
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                        key = weekStart.toISOString().split('T')[0];
                    }
                    else {
                        key = app.createdAt.getFullYear() + '-' +
                            String(app.createdAt.getMonth() + 1).padStart(2, '0');
                    }
                    if (!grouped[key]) {
                        grouped[key] = { total: 0, approved: 0, rejected: 0, pending: 0 };
                    }
                    grouped[key].total++;
                    if (app.status === 'APPROVED' || app.status === 'DELIVERED') {
                        grouped[key].approved++;
                    }
                    else if (app.status === 'REJECTED') {
                        grouped[key].rejected++;
                    }
                    else {
                        grouped[key].pending++;
                    }
                });
                const data = Object.entries(grouped).map(([date, stats]) => ({
                    date,
                    ...stats,
                    approvalRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
                }));
                return reply.send({
                    period,
                    limit: limitNum,
                    startDate,
                    endDate: now,
                    data
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getProcessingMetrics = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const where = { organizationId: orgId };
                if (user.role === 'AGENCY_EMPLOYEE') {
                    where.applicant = { group: { assignedEmployeeId: user.id } };
                }
                // Get all applications for processing analysis
                const applications = await this.server.prisma.application.findMany({
                    where,
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        applicant: {
                            select: {
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
                // Calculate metrics
                const metrics = {
                    byStatus: {},
                    byGroup: {},
                    avgProcessingDays: 0,
                    totalProcessed: 0,
                    successCount: 0,
                    failureCount: 0
                };
                let totalProcessingTime = 0;
                let processedCount = 0;
                applications.forEach(app => {
                    // By status
                    if (!metrics.byStatus[app.status]) {
                        metrics.byStatus[app.status] = 0;
                    }
                    metrics.byStatus[app.status]++;
                    // By group
                    const groupKey = `${app.applicant.group.code} - ${app.applicant.group.name}`;
                    if (!metrics.byGroup[groupKey]) {
                        metrics.byGroup[groupKey] = 0;
                    }
                    metrics.byGroup[groupKey]++;
                    // Processing time (for completed applications)
                    if (app.status === 'APPROVED' || app.status === 'DELIVERED' || app.status === 'REJECTED') {
                        const processingTime = (app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                        totalProcessingTime += processingTime;
                        processedCount++;
                        /* Lines 321-328 omitted */
                    }
                });
                if (processedCount > 0) {
                    metrics.avgProcessingDays = Math.round((totalProcessingTime / processedCount) * 10) / 10;
                }
                return reply.send({
                    metrics,
                    successRate: metrics.totalProcessed > 0
                        ? Math.round((metrics.successCount / metrics.totalProcessed) * 100)
                        : 0,
                    failureRate: metrics.totalProcessed > 0
                        ? Math.round((metrics.failureCount / metrics.totalProcessed) * 100)
                        : 0
                });
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getRecent = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { limit = 10 } = request.query;
                const where = { organizationId: orgId };
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
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getChartData = async (request, reply) => {
            try {
                const user = request.user;
                const orgId = request.organizationId;
                const { period = '30d' } = request.query;
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
                const where = {
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
                const dailyData = {};
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
                    }
                    else if (app.status === 'REJECTED') {
                        dailyData[date].rejected++;
                    }
                    else {
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
            }
            catch (error) {
                return reply.status(500).send({
                    error: 'Server Error',
                    message: error.message
                });
            }
        };
        this.getSuperAdminStats = async (request, reply) => {
            try {
                const user = request.user;
                if (user.role !== 'SUPER_ADMIN') {
                    return reply.status(403).send({
                        error: 'Forbidden',
                        message: 'Super admin only'
                    });
                }
                const [totalOrganizations, activeOrganizations, totalUsers, totalApplicants, totalApplications, applicationStats] = await Promise.all([
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
                const statusCounts = applicationStats.reduce((acc, curr) => {
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
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map