"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthService {
    constructor(server) {
        this.server = server;
    }
    async login(email, password) {
        const user = await this.server.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { organization: true }
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }
        // Generate tokens
        let token = this.server.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId
        }, { expiresIn: '24h' });
        const refreshToken = this.server.jwt.sign({ id: user.id, type: 'refresh' }, { expiresIn: '7d' });
        // sanitize tokens to ensure no accidental whitespace/newlines
        if (typeof token === 'string') {
            token = token.replace(/\s+/g, '');
        }
        let cleanRefreshToken = refreshToken;
        if (typeof refreshToken === 'string') {
            cleanRefreshToken = refreshToken.replace(/\s+/g, '');
        }
        // Create session
        const session = await this.server.prisma.session.create({
            data: {
                token,
                userId: user.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });
        // Update last login
        await this.server.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        return {
            token,
            refreshToken: cleanRefreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                organizationId: user.organizationId,
                organization: user.organization
            }
        };
    }
    async logout(token) {
        // Try to decode token to get expiry and user id
        let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        let userId = null;
        try {
            const decoded = this.server.jwt.decode(token);
            if (decoded && decoded.exp) {
                expiresAt = new Date(decoded.exp * 1000);
            }
            if (decoded && decoded.id) {
                userId = decoded.id;
            }
        }
        catch (err) {
            // ignore decode errors
        }
        // Add token to blacklist
        try {
            await this.server.prisma.tokenBlacklist.create({
                data: {
                    token,
                    userId,
                    expiresAt
                }
            });
        }
        catch (err) {
            // ignore if blacklist creation fails
        }
        // Remove any active session entries
        await this.server.prisma.session.deleteMany({ where: { token } });
    }
    async refresh(refreshToken) {
        try {
            const decoded = this.server.jwt.verify(refreshToken);
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }
            const user = await this.server.prisma.user.findUnique({
                where: { id: decoded.id }
            });
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }
            const newToken = this.server.jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            }, { expiresIn: '24h' });
            // Create new session
            await this.server.prisma.session.create({
                data: {
                    token: newToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
            return { token: newToken };
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    async forgotPassword(email) {
        // In production, send email with reset link
        // For now, just log
        console.log(`Password reset requested for: ${email}`);
    }
    async resetPassword(token, password) {
        // In production, verify token and update password
        // Simplified for demo
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Update user password logic here
    }
    async getProfile(userId) {
        const user = await this.server.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: true,
                _count: {
                    select: {
                        assignedGroups: true
                    }
                }
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            organizationId: user.organizationId,
            organization: user.organization,
            assignedGroupsCount: user._count.assignedGroups,
            lastLogin: user.lastLogin
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map