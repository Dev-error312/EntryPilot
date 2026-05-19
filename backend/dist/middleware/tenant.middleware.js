"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = tenantMiddleware;
async function tenantMiddleware(request, reply) {
    const user = request.user;
    if (!user) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }
    // Super admins can access all organizations - organizationId must be provided
    if (user.role === 'SUPER_ADMIN') {
        // Try to get organizationId from various sources
        const orgId = request.query?.organizationId ||
            request.body?.organizationId ||
            request.params?.organizationId;
        if (!orgId) {
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Super admins must specify organizationId'
            });
        }
        request.organizationId = orgId;
        return;
    }
    // Agency users must have an organization
    if (!user.organizationId) {
        return reply.status(403).send({
            error: 'Forbidden',
            message: 'No organization assigned'
        });
    }
    // Set organizationId for the request
    request.organizationId = user.organizationId;
}
//# sourceMappingURL=tenant.middleware.js.map