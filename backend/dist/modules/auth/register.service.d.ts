import { FastifyInstance } from 'fastify';
export declare class RegisterService {
    private server;
    constructor(server: FastifyInstance);
    registerOrganization(data: {
        organizationName: string;
        organizationCode: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            phone: string | null;
            avatar: string | null;
            isActive: boolean;
            lastLogin: Date | null;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string | null;
        };
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
        };
    }>;
}
//# sourceMappingURL=register.service.d.ts.map