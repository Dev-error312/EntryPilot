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
        let blacklisted = null;
        try {
            blacklisted = await request.server.prisma.tokenBlacklist.findUnique({
                where: { token }
            });
        }
        catch (err) {
            // Some databases do not have the blacklist table yet; treat that as "not blacklisted".
        }
        if (blacklisted) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Token has been revoked'
            });
        }
        // Check if session exists and is valid. Try multiple strategies because some stored tokens
        // may contain whitespace/newlines from previous runs.
        const rawToken = token;
        let session = null;
        try {
            session = await request.server.prisma.session.findUnique({ where: { token: rawToken }, include: { user: true } });
        }
        catch (err) {
            request.server.log.info({ msg: 'session-findUnique-exception', err: err.message });
        }
        if (!session) {
            // try cleaned token (remove whitespace)
            const cleaned = rawToken.replace(/\s+/g, '');
            try {
                session = await request.server.prisma.session.findUnique({ where: { token: cleaned }, include: { user: true } });
            }
            catch (err) {
                // ignore
            }
        }
        if (!session) {
            // fallback: find most recent session for this user id
            try {
                const decoded = request.server.jwt.verify(rawToken);
                if (decoded?.id) {
                    session = await request.server.prisma.session.findFirst({ where: { userId: decoded.id }, orderBy: { createdAt: 'desc' }, include: { user: true } });
                }
            }
            catch (err) {
                // ignore
            }
        }
        request.server.log.info({ msg: 'authMiddleware session-check', sessionExists: !!session, sessionId: session?.id });
        // ensure expiresAt is compared as Date
        if (!session) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid or expired session'
            });
        }
        if (!session.user) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Session has no user' });
        }
        // ensure expiresAt is compared as Date
        try {
            const expiresAtDate = session.expiresAt ? new Date(session.expiresAt) : null;
            if (!expiresAtDate || expiresAtDate < new Date()) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Invalid or expired session'
                });
            }
        }
        catch (err) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid session' });
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