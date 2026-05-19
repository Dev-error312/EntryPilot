import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        authenticate: any;
        tenantGuard: any;
    }
}
//# sourceMappingURL=server.d.ts.map