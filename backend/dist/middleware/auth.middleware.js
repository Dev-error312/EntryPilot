"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
async function authMiddleware(request, reply) {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const decoded = request.server.jwt.verify(token);
        // Check if token is blacklisted
        const blacklisted = await request.server.prisma.tokenBlacklist.findUnique({
            where: { token }
        });
        if (blacklisted) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Token has been revoked'
            });
        }
        // Check if session exists and is valid
        const session = await request.server.prisma.session.findUnique({
            where: { token },
            include: { user: true }
        });
        if (!session || session.expiresAt < new Date()) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid or expired session'
            });
        }
        if (!session.user.isActive) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'User account is deactivated'
            });
        }
        // Attach user to request
        request.user = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            organizationId: session.user.organizationId,
            firstName: session.user.firstName,
            lastName: session.user.lastName
        };
    }
    catch (error) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map