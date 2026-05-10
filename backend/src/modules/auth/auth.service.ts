import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  constructor(private server: FastifyInstance) {}

  async login(email: string, password: string) {
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

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const token = this.server.jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId 
      },
      { expiresIn: '24h' }
    );

    const refreshToken = this.server.jwt.sign(
      { id: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

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
      refreshToken,
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

  async logout(token: string) {
    await this.server.prisma.session.deleteMany({
      where: { token }
    });
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.server.jwt.verify(refreshToken) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await this.server.prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const newToken = this.server.jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          organizationId: user.organizationId 
        },
        { expiresIn: '24h' }
      );

      // Create new session
      await this.server.prisma.session.create({
        data: {
          token: newToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    // In production, send email with reset link
    // For now, just log
    console.log(`Password reset requested for: ${email}`);
  }

  async resetPassword(token: string, password: string) {
    // In production, verify token and update password
    // Simplified for demo
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update user password logic here
  }

  async getProfile(userId: string) {
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
