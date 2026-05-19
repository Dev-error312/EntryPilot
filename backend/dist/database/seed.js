"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create Super Admin
    const superAdminPassword = await bcryptjs_1.default.hash('admin123', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'super@entrypilot.com' },
        update: {},
        create: {
            email: 'super@entrypilot.com',
            password: superAdminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
            isActive: true
        }
    });
    console.log('✅ Super Admin created:', superAdmin.email);
    // Create Demo Organization
    const demoOrg = await prisma.organization.upsert({
        where: { code: 'DEMO' },
        update: {},
        create: {
            name: 'Demo Travel Agency',
            code: 'DEMO',
            email: 'demo@entrypilot.com',
            phone: '+1-555-0100',
            address: '123 Travel Street, City, Country',
            maxSeats: 25,
            usedSeats: 3,
            isActive: true
        }
    });
    console.log('✅ Demo Organization created:', demoOrg.name);
    // Create Agency Admin
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    const agencyAdmin = await prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {},
        create: {
            email: 'admin@demo.com',
            password: adminPassword,
            firstName: 'Agency',
            lastName: 'Admin',
            role: 'AGENCY_ADMIN',
            phone: '+1-555-0101',
            organizationId: demoOrg.id,
            isActive: true
        }
    });
    console.log('✅ Agency Admin created:', agencyAdmin.email);
    // Create Employee
    const employeePassword = await bcryptjs_1.default.hash('employee123', 10);
    const employee = await prisma.user.upsert({
        where: { email: 'employee@demo.com' },
        update: {},
        create: {
            email: 'employee@demo.com',
            password: employeePassword,
            firstName: 'John',
            lastName: 'Processor',
            role: 'AGENCY_EMPLOYEE',
            phone: '+1-555-0102',
            organizationId: demoOrg.id,
            isActive: true
        }
    });
    console.log('✅ Employee created:', employee.email);
    // Create Sample Groups
    const groups = [
        {
            code: 'KMY2026-AUG',
            name: 'Kailash August Full Moon Batch',
            travelDate: new Date('2026-08-15'),
            externalAgent: 'Himalaya Tours',
            notes: 'Pilgrimage group - 40 people'
        },
        {
            code: 'THA2026-SEP',
            name: 'Thailand Corporate Delegation',
            travelDate: new Date('2026-09-10'),
            externalAgent: 'Bangkok Business Tours',
            notes: 'Corporate visa processing'
        },
        {
            code: 'CHN2026-OCT',
            name: 'China Trade Fair Group',
            travelDate: new Date('2026-10-05'),
            externalAgent: 'Shanghai Connect',
            notes: 'Canton Fair attendees'
        }
    ];
    for (const groupData of groups) {
        const group = await prisma.group.upsert({
            where: {
                code_organizationId: {
                    code: groupData.code,
                    organizationId: demoOrg.id
                }
            },
            update: {},
            create: {
                ...groupData,
                assignedEmployeeId: employee.id,
                organizationId: demoOrg.id
            }
        });
        console.log('✅ Group created:', group.code);
        // Create sample applicants for each group
        const applicants = [
            { firstName: 'Ram', lastName: 'Sharma', nationality: 'Indian', passportNumber: 'AB1234567' },
            { firstName: 'Sita', lastName: 'Thapa', nationality: 'Nepali', passportNumber: 'NP9876543' },
            { firstName: 'Hari', lastName: 'Adhikari', nationality: 'Nepali', passportNumber: 'NP1122334' }
        ];
        for (const appData of applicants) {
            const applicant = await prisma.applicant.create({
                data: {
                    ...appData,
                    email: `${appData.firstName.toLowerCase()}.${appData.lastName.toLowerCase()}@example.com`,
                    phone: '+1-555-' + Math.floor(1000 + Math.random() * 9000),
                    groupId: group.id,
                    organizationId: demoOrg.id
                }
            });
            // Create a sample application for each applicant
            await prisma.application.create({
                data: {
                    referenceNumber: `VF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    visaType: 'Tourist',
                    destinationCountry: groupData.code.substring(0, 2) === 'TH' ? 'Thailand' : groupData.code.substring(0, 2) === 'CH' ? 'China' : 'Nepal',
                    status: ['DRAFT', 'REVIEW', 'PROCESSING', 'APPROVED'][Math.floor(Math.random() * 4)],
                    applicantId: applicant.id,
                    organizationId: demoOrg.id
                }
            });
        }
    }
    // Create Sample Templates
    const templates = [
        {
            name: 'Thailand Tourist Visa',
            country: 'Thailand',
            visaType: 'Tourist',
            description: 'Standard tourist visa for Thailand',
            fields: [
                { id: 'passport', label: 'Passport Number', type: 'text', required: true },
                { id: 'arrival', label: 'Arrival Date', type: 'date', required: true },
                { id: 'departure', label: 'Departure Date', type: 'date', required: true },
                { id: 'hotel', label: 'Hotel Name', type: 'text', required: true },
                { id: 'purpose', label: 'Purpose of Visit', type: 'select', options: ['Tourism', 'Business', 'Transit'], required: true }
            ]
        },
        {
            name: 'China Tourist Visa',
            country: 'China',
            visaType: 'Tourist',
            description: 'L visa for tourism in China',
            fields: [
                { id: 'passport', label: 'Passport Number', type: 'text', required: true },
                { id: 'entries', label: 'Number of Entries', type: 'select', options: ['Single', 'Double', 'Multiple'], required: true },
                { id: 'duration', label: 'Duration of Stay', type: 'number', required: true },
                { id: 'cities', label: 'Cities to Visit', type: 'textarea', required: true }
            ]
        },
        {
            name: 'India Pilgrimage Visa',
            country: 'India',
            visaType: 'Pilgrimage',
            description: 'Special pilgrimage visa for religious sites',
            fields: [
                { id: 'passport', label: 'Passport Number', type: 'text', required: true },
                { id: 'religion', label: 'Religion', type: 'text', required: true },
                { id: 'sites', label: 'Pilgrimage Sites', type: 'textarea', required: true },
                { id: 'group', label: 'Group Leader Name', type: 'text', required: true }
            ]
        }
    ];
    for (const templateData of templates) {
        await prisma.template.upsert({
            where: {
                name_country_visaType_organizationId: {
                    name: templateData.name,
                    country: templateData.country,
                    visaType: templateData.visaType,
                    organizationId: demoOrg.id
                }
            },
            update: {},
            create: {
                ...templateData,
                organizationId: demoOrg.id
            }
        });
        console.log('✅ Template created:', templateData.name);
    }
    // Create audit logs for seed data
    await prisma.auditLog.create({
        data: {
            action: 'SEED_DATABASE',
            entityType: 'System',
            entityId: 'seed',
            newValues: { message: 'Database seeded with demo data' },
            userId: superAdmin.id,
            organizationId: demoOrg.id
        }
    });
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Super Admin: super@entrypilot.com / admin123');
    console.log('   Agency Admin: admin@demo.com / admin123');
    console.log('   Employee: employee@demo.com / employee123');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map