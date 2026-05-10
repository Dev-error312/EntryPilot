# EntryPilot - Multi-Tenant SaaS Visa Processing Platform

A comprehensive visa processing management platform built with the PERN stack (PostgreSQL, Express/Fastify, React/Next.js, Node.js).

## 🚀 Features

### Core Modules
- **Multi-Tenancy**: Organization-level data isolation
- **User Management**: Role-based access (Super Admin, Agency Admin, Employee)
- **Groups**: Travel batch management with employee assignment
- **Applicants**: Group-based traveler management
- **Applications**: Full visa workflow (Draft → Review → Ready → Submitted → Processing → Approved/Rejected → Delivered)
- **Templates**: Country-specific visa form templates
- **OCR Import**: File upload with data extraction (PDF, Excel, CSV, Images)
- **Audit Logs**: Complete action tracking

### Technical Features
- JWT authentication with refresh tokens
- Multi-tenant data isolation via `organizationId`
- RESTful API with validation
- Real-time dashboard statistics
- Premium UI with Framer Motion animations

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🛠️ Installation

### 1. Clone and Setup

```bash
# Navigate to project
cd visaflow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb visaflow

# Configure environment
cd backend
# Edit .env with your database URL

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prisma Studio: `cd backend && npm run db:studio`

## 👥 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@entrypilot.com | admin123 |
| Agency Admin | admin@demo.com | admin123 |
| Employee | employee@demo.com | employee123 |

## 📁 Project Structure

```
visaflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── server.ts              # Fastify server
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT authentication
│   │   │   └── tenant.middleware.ts # Multi-tenancy guard
│   │   ├── modules/
│   │   │   ├── auth/              # Authentication
│   │   │   ├── organizations/     # Agency management
│   │   │   ├── users/             # User management
│   │   │   ├── groups/            # Travel groups
│   │   │   ├── applicants/        # Travelers
│   │   │   ├── applications/      # Visa applications
│   │   │   ├── templates/         # Form templates
│   │   │   ├── imports/           # File uploads & OCR
│   │   │   ├── audit/             # Activity logs
│   │   │   └── dashboard/         # Statistics
│   │   └── database/
│   │       └── seed.ts            # Demo data
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home redirect
│   │   ├── login/                 # Login page
│   │   ├── dashboard/             # Dashboard
│   │   ├── groups/                # Group management
│   │   ├── applicants/            # Applicant management
│   │   ├── applications/          # Application management
│   │   └── import/                # File import
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx        # Navigation sidebar
│   │       ├── Navbar.tsx         # Top navigation
│   │       └── DashboardLayout.tsx # Layout wrapper
│   ├── store/
│   │   └── authStore.ts           # Zustand auth state
│   ├── lib/
│   │   └── api.ts                 # API client
│   └── package.json
│
└── README.md
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Organization-level data isolation
- Role-based access control (RBAC)
- Session management
- Input validation with Zod

## 🎨 Design System

- Premium SaaS aesthetic (Vercel/Linear style)
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Inter font family

## 📊 Application Status Flow

```
DRAFT → REVIEW → READY → SUBMITTED → PROCESSING → APPROVED/REJECTED → DELIVERED
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Organizations (Super Admin)
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Groups
- `GET /api/groups` - List groups
- `GET /api/groups/active` - List active groups
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group

### Applicants
- `GET /api/applicants` - List applicants
- `GET /api/applicants/grouped` - List grouped by batch
- `POST /api/applicants` - Create applicant
- `PUT /api/applicants/:id` - Update applicant

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Create application
- `POST /api/applications/:id/submit` - Submit application
- `POST /api/applications/:id/approve` - Approve application
- `POST /api/applications/:id/reject` - Reject application

### Import
- `POST /api/imports/upload` - Upload file
- `POST /api/imports/:id/process` - Process import

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ using PERN Stack
