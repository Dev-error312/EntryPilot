"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const client_1 = require("@prisma/client");
const auth_routes_1 = require("./modules/auth/auth.routes");
const organization_routes_1 = require("./modules/organizations/organization.routes");
const user_routes_1 = require("./modules/users/user.routes");
const group_routes_1 = require("./modules/groups/group.routes");
const applicant_routes_1 = require("./modules/applicants/applicant.routes");
const application_routes_1 = require("./modules/applications/application.routes");
const template_routes_1 = require("./modules/templates/template.routes");
const import_routes_1 = require("./modules/imports/import.routes");
const audit_routes_1 = require("./modules/audit/audit.routes");
const dashboard_routes_1 = require("./modules/dashboard/dashboard.routes");
const template_routes_2 = require("./modules/imports/template.routes");
const visa_forms_routes_1 = require("./modules/visa-forms/visa-forms.routes");
const batch_template_routes_1 = require("./modules/batch-templates/batch-template.routes");
const visa_application_routes_1 = require("./modules/visa-applications/visa-application.routes");
const visa_document_routes_1 = require("./modules/visa-documents/visa-document.routes");
const auth_middleware_1 = require("./middleware/auth.middleware");
const tenant_middleware_1 = require("./middleware/tenant.middleware");
exports.prisma = new client_1.PrismaClient();
const server = (0, fastify_1.default)({
    logger: true
});
async function bootstrap() {
    // Register plugins
    await server.register(cors_1.default, {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
    });
    await server.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || (() => {
            throw new Error('JWT_SECRET environment variable is required');
        })()
    });
    await server.register(multipart_1.default, {
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB
        }
    });
    // Decorate server with prisma
    server.decorate('prisma', exports.prisma);
    // Auth middleware decorator
    server.decorate('authenticate', auth_middleware_1.authMiddleware);
    server.decorate('tenantGuard', tenant_middleware_1.tenantMiddleware);
    // Health check
    server.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
    // Register routes
    await server.register(auth_routes_1.authRoutes, { prefix: '/api/auth' });
    await server.register(organization_routes_1.organizationRoutes, { prefix: '/api/organizations' });
    await server.register(user_routes_1.userRoutes, { prefix: '/api/users' });
    await server.register(group_routes_1.groupRoutes, { prefix: '/api/groups' });
    await server.register(applicant_routes_1.applicantRoutes, { prefix: '/api/applicants' });
    await server.register(application_routes_1.applicationRoutes, { prefix: '/api/applications' });
    await server.register(template_routes_1.templateRoutes, { prefix: '/api/templates' });
    await server.register(import_routes_1.importRoutes, { prefix: '/api/imports' });
    await server.register(template_routes_2.templateRoutes, { prefix: '/api/imports/templates' });
    await server.register(audit_routes_1.auditRoutes, { prefix: '/api/audit' });
    await server.register(dashboard_routes_1.dashboardRoutes, { prefix: '/api/dashboard' });
    await server.register(visa_forms_routes_1.visaFormsRoutes, { prefix: '/api/visa-forms' });
    await server.register(batch_template_routes_1.batchTemplateRoutes, { prefix: '/api/batch-templates' });
    await server.register(visa_application_routes_1.visaApplicationRoutes, { prefix: '/api/visa-applications' });
    await server.register(visa_document_routes_1.visaDocumentRoutes, { prefix: '/api/visa-documents' });
    // Start server
    try {
        const port = parseInt(process.env.PORT || '4000', 10);
        const address = await server.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 EntryPilot API running at ${address}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map