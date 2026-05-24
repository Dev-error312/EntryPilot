-- PHASE 7: DATABASE OPTIMIZATION - ADD MISSING INDEXES
-- File: backend/prisma/migrations/add_missing_indexes/migration.sql
-- These indexes improve query performance for dashboard and search operations

-- 1. Application Status Index (for dashboard aggregation)
CREATE INDEX IF NOT EXISTS "idx_application_org_status" 
ON "applications"("organizationId", "status");

-- 2. Group Name Index (for search/filter operations)
CREATE INDEX IF NOT EXISTS "idx_group_name" 
ON "groups"("name" COLLATE "C");

-- 3. Import Status Index (for OCR metrics)
CREATE INDEX IF NOT EXISTS "idx_import_status" 
ON "imports"("status");

CREATE INDEX IF NOT EXISTS "idx_import_org_status"
ON "imports"("organizationId", "status");

-- 4. Application Created At Index (for trend queries)
CREATE INDEX IF NOT EXISTS "idx_application_created_at"
ON "applications"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_application_org_created"
ON "applications"("organizationId", "createdAt" DESC);

-- 5. Applicant Email Organization Index (for fast dedup check)
CREATE INDEX IF NOT EXISTS "idx_applicant_org_email"
ON "applicants"("organizationId", "email");

CREATE INDEX IF NOT EXISTS "idx_applicant_org_passport"
ON "applicants"("organizationId", "passportNumber");

-- 6. Group Employee Active Index (for employee view filtering)
CREATE INDEX IF NOT EXISTS "idx_group_employee_active"
ON "groups"("assignedEmployeeId", "isActive");

-- 7. Applicant Group Active Index (for list queries)
CREATE INDEX IF NOT EXISTS "idx_applicant_group_active"
ON "applicants"("groupId", "isActive");

-- 8. Application Applicant Status Index (for per-applicant stats)
CREATE INDEX IF NOT EXISTS "idx_application_applicant_status"
ON "applications"("applicantId", "status");

-- 9. Import Status Timestamp (for retry logic)
CREATE INDEX IF NOT EXISTS "idx_import_status_created"
ON "imports"("status", "createdAt" DESC);

-- 10. Applicant Search Index (for combined search)
CREATE INDEX IF NOT EXISTS "idx_applicant_name_search"
ON "applicants"("organizationId", "firstName", "lastName");

-- Verify indexes created
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('applications', 'groups', 'imports', 'applicants')
ORDER BY tablename, indexname;
