import { FastifyInstance } from 'fastify';
export declare class AuthService {
    private server;
    constructor(server: FastifyInstance);
    login(email: string, password: string): Promise<{
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            organizationId: string | null;
            organization: {
                id: string;
                email: string;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                address: string | null;
                logo: string | null;
                maxSeats: number;
                usedSeats: number;
                subscriptionEnd: Date | null;
            } | null;
        };
    }>;
    logout(token: string): Promise<void>;
    refresh(refreshToken: string): Promise<{
        token: string;
    }>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string | null;
        avatar: string | null;
        organizationId: string | null;
        organization: {
            id: string;
            email: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            logo: string | null;
            maxSeats: number;
            usedSeats: number;
            subscriptionEnd: Date | null;
        } | null;
        assignedGroupsCount: number;
        lastLogin: Date | null;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map