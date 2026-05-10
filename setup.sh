#!/bin/bash

echo "🚀 Setting up EntryPilot..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed."; exit 1; }

echo "✅ Prerequisites check passed"

# Create database
echo "📦 Creating database..."
createdb visaflow 2>/dev/null || echo "Database already exists or couldn't be created"

# Setup Backend
echo "📦 Setting up backend..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "📊 Pushing schema to database..."
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
npx ts-node src/database/seed.ts

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📧 Demo Credentials:"
echo "   Super Admin: super@entrypilot.com / admin123"
echo "   Agency Admin: admin@demo.com / admin123"
echo "   Employee: employee@demo.com / employee123"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "   Then open http://localhost:3000"
echo ""
