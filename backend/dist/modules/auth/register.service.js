"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const password_validator_1 = require("../../utils/password.validator");
class RegisterService {
    constructor(server) {
        this.server = server;
    }
    async registerOrganization(data) {
        const { organizationName, organizationCode, email, password, firstName, lastName } = data;
        // Validate password strength
        const pwdValidation = (0, password_validator_1.validatePasswordStrength)(password);
        if (!pwdValidation.valid) {
            throw new Error(pwdValidation.errors.join('; '));
        }
        // Check email and org code uniqueness
        const existingUser = await this.server.prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            throw new Error('Email already registered');
        }
        const existingOrg = await this.server.prisma.organization.findUnique({
            where: { code: organizationCode }
        });
        if (existingOrg) {
            throw new Error('Organization code already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create organization and first user in a transaction
        const result = await this.server.prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: organizationName,
                    code: organizationCode,
                    email: email.toLowerCase(),
                    maxSeats: 5,
                    usedSeats: 1
                }
            });
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: 'AGENCY_ADMIN',
                    organizationId: organization.id
                }
            });
            // Create initial session/token
            const token = this.server.jwt.sign({ id: user.id, email: user.email, role: user.role, organizationId: organization.id }, { expiresIn: '24h' });
            const refreshToken = this.server.jwt.sign({ id: user.id, type: 'refresh' }, { expiresIn: '7d' });
            await tx.session.create({
                data: {
                    token,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
            return { token, refreshToken, user, organization };
        });
        return result;
    }
}
exports.RegisterService = RegisterService;
//# sourceMappingURL=register.service.js.map