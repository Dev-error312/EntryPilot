import { FastifyRequest, FastifyReply } from 'fastify';

export async function tenantMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;

  if (!user) {
    return reply.status(401).send({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    });
  }

  // Super admins can access all organizations
  if (user.role === 'SUPER_ADMIN') {
    // For super admin, allow organizationId from query params or body
    const orgId = (request.query as any)?.organizationId || 
                  (request.body as any)?.organizationId ||
                  request.params && (request.params as any).organizationId;
    
    if (orgId) {
      (request as any).organizationId = orgId;
    }
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
  (request as any).organizationId = user.organizationId;
}
