-- DropForeignKey
ALTER TABLE "applicants" DROP CONSTRAINT "applicants_groupId_fkey";

-- DropForeignKey
ALTER TABLE "applicants" DROP CONSTRAINT "applicants_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "imports" DROP CONSTRAINT "imports_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_organizationId_fkey";

-- CreateTable
CREATE TABLE "applicant_drafts" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "extractedData" JSONB NOT NULL,
    "fieldConfidence" JSONB NOT NULL,
    "confidence" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "corrections" JSONB,
    "originalSource" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicant_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_application_forms" (
    "id" TEXT NOT NULL,
    "visaPhotoId" TEXT,
    "passportPage1Id" TEXT,
    "passportPage2Id" TEXT,
    "passportBackPageId" TEXT,
    "fullName" TEXT NOT NULL,
    "placeOfBirthCountry" TEXT,
    "placeOfBirthProvince" TEXT,
    "placeOfBirthCity" TEXT,
    "maritalStatus" TEXT,
    "maritalStatusOther" TEXT,
    "hasOtherNationality" BOOLEAN NOT NULL DEFAULT false,
    "otherNationality" TEXT,
    "otherNationalityIdNumber" TEXT,
    "otherNationalityPassportNumber" TEXT,
    "otherNationalityNotProvidedReason" TEXT,
    "hasPermanentResidence" BOOLEAN NOT NULL DEFAULT false,
    "permanentResidenceCountries" TEXT,
    "hasFormerNationality" BOOLEAN NOT NULL DEFAULT false,
    "formerNationality" TEXT,
    "currentOccupation" TEXT,
    "workExperienceStartDate" TIMESTAMP(3),
    "workExperienceEndDate" TIMESTAMP(3),
    "companyName" TEXT,
    "companyAddress" TEXT,
    "companyPhone" TEXT,
    "supervisorName" TEXT,
    "supervisorPhone" TEXT,
    "position" TEXT,
    "duty" TEXT,
    "schoolName" TEXT,
    "educationLevel" TEXT,
    "majorSubject" TEXT,
    "residenceCountry" TEXT,
    "residenceProvince" TEXT,
    "residenceCity" TEXT,
    "residenceStreet" TEXT,
    "residenceMobilePhone" TEXT,
    "residencePhone" TEXT,
    "residenceEmail" TEXT,
    "spouseFirstName" TEXT,
    "spouseLastName" TEXT,
    "spouseDateOfBirth" TIMESTAMP(3),
    "spouseCountryOfBirth" TEXT,
    "spouseCityOfBirth" TEXT,
    "spouseAddress" TEXT,
    "spouseOccupation" TEXT,
    "fatherFirstName" TEXT,
    "fatherLastName" TEXT,
    "fatherNationality" TEXT,
    "fatherDateOfBirth" TIMESTAMP(3),
    "fatherStillLiving" BOOLEAN,
    "motherFirstName" TEXT,
    "motherLastName" TEXT,
    "motherNationality" TEXT,
    "motherDateOfBirth" TIMESTAMP(3),
    "motherStillLiving" BOOLEAN,
    "children" JSONB,
    "emergencyFirstName" TEXT,
    "emergencyLastName" TEXT,
    "emergencyRelationship" TEXT,
    "emergencyPhone" TEXT,
    "hasBeenToChina" BOOLEAN NOT NULL DEFAULT false,
    "previousChineseVisaIds" TEXT,
    "hasValidVisas" BOOLEAN NOT NULL DEFAULT false,
    "validVisaCountries" TEXT,
    "countriesVisitedLast12Months" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "applicantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "visa_application_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_pre_fill_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inviterFullName" TEXT,
    "inviterCompanyName" TEXT,
    "inviterPosition" TEXT,
    "inviterPhone" TEXT,
    "inviterEmail" TEXT,
    "inviterAddress" TEXT,
    "inviterCountry" TEXT NOT NULL DEFAULT 'China',
    "inviterProvince" TEXT,
    "inviterCity" TEXT,
    "purposeOfVisit" TEXT,
    "visaType" TEXT,
    "visaDuration" INTEGER,
    "intendedArrivalDate" TIMESTAMP(3),
    "intendedDepartureDate" TIMESTAMP(3),
    "hotelName" TEXT,
    "hotelAddress" TEXT,
    "hotelPhone" TEXT,
    "hotelCheckInDate" TIMESTAMP(3),
    "hotelCheckOutDate" TIMESTAMP(3),
    "ticketReceiptIds" TEXT,
    "hotelBookingIds" TEXT,
    "itineraryIds" TEXT,
    "invitationLetterIds" TEXT,
    "groupNumber" INTEGER,
    "groupLeaderName" TEXT,
    "groupLeaderPhone" TEXT,
    "insuranceProvider" TEXT,
    "insurancePolicyNumber" TEXT,
    "insuranceCoverageAmount" TEXT,
    "visaFeeAmount" DECIMAL(65,30),
    "serviceFeeAmount" DECIMAL(65,30),
    "totalAmount" DECIMAL(65,30),
    "paymentMethod" TEXT,
    "appliedByEmployeeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "batch_pre_fill_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complete_visa_applications" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "formDataId" TEXT NOT NULL,
    "batchTemplateId" TEXT,
    "applicantFullName" TEXT NOT NULL,
    "applicantEmail" TEXT,
    "applicantPhone" TEXT,
    "applicantDOB" TIMESTAMP(3),
    "inviterFullName" TEXT,
    "inviterCompany" TEXT,
    "inviterPhone" TEXT,
    "inviterEmail" TEXT,
    "purposeOfVisit" TEXT,
    "visaType" TEXT,
    "intendedArrivalDate" TIMESTAMP(3),
    "intendedDepartureDate" TIMESTAMP(3),
    "ticketReceiptIds" TEXT,
    "hotelBookingIds" TEXT,
    "itineraryIds" TEXT,
    "invitationLetterIds" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "applicantId" TEXT,

    CONSTRAINT "complete_visa_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_application_documents" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "documentCategory" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "associatedWith" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "visa_application_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_blacklist" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blacklistedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applicant_drafts_importId_idx" ON "applicant_drafts"("importId");

-- CreateIndex
CREATE INDEX "applicant_drafts_organizationId_idx" ON "applicant_drafts"("organizationId");

-- CreateIndex
CREATE INDEX "applicant_drafts_status_idx" ON "applicant_drafts"("status");

-- CreateIndex
CREATE INDEX "applicant_drafts_confidence_idx" ON "applicant_drafts"("confidence");

-- CreateIndex
CREATE INDEX "visa_application_forms_organizationId_idx" ON "visa_application_forms"("organizationId");

-- CreateIndex
CREATE INDEX "visa_application_forms_groupId_idx" ON "visa_application_forms"("groupId");

-- CreateIndex
CREATE INDEX "visa_application_forms_status_idx" ON "visa_application_forms"("status");

-- CreateIndex
CREATE INDEX "batch_pre_fill_templates_organizationId_idx" ON "batch_pre_fill_templates"("organizationId");

-- CreateIndex
CREATE INDEX "batch_pre_fill_templates_groupId_idx" ON "batch_pre_fill_templates"("groupId");

-- CreateIndex
CREATE INDEX "batch_pre_fill_templates_isActive_idx" ON "batch_pre_fill_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "complete_visa_applications_referenceNumber_key" ON "complete_visa_applications"("referenceNumber");

-- CreateIndex
CREATE INDEX "complete_visa_applications_organizationId_idx" ON "complete_visa_applications"("organizationId");

-- CreateIndex
CREATE INDEX "complete_visa_applications_groupId_idx" ON "complete_visa_applications"("groupId");

-- CreateIndex
CREATE INDEX "complete_visa_applications_applicantId_idx" ON "complete_visa_applications"("applicantId");

-- CreateIndex
CREATE INDEX "complete_visa_applications_status_idx" ON "complete_visa_applications"("status");

-- CreateIndex
CREATE INDEX "complete_visa_applications_referenceNumber_idx" ON "complete_visa_applications"("referenceNumber");

-- CreateIndex
CREATE INDEX "visa_application_documents_organizationId_idx" ON "visa_application_documents"("organizationId");

-- CreateIndex
CREATE INDEX "visa_application_documents_documentType_idx" ON "visa_application_documents"("documentType");

-- CreateIndex
CREATE INDEX "visa_application_documents_uploadedBy_idx" ON "visa_application_documents"("uploadedBy");

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_token_key" ON "token_blacklist"("token");

-- CreateIndex
CREATE INDEX "token_blacklist_token_idx" ON "token_blacklist"("token");

-- CreateIndex
CREATE INDEX "token_blacklist_userId_idx" ON "token_blacklist"("userId");

-- CreateIndex
CREATE INDEX "token_blacklist_expiresAt_idx" ON "token_blacklist"("expiresAt");

-- CreateIndex
CREATE INDEX "applicants_organizationId_idx" ON "applicants"("organizationId");

-- CreateIndex
CREATE INDEX "applicants_groupId_idx" ON "applicants"("groupId");

-- CreateIndex
CREATE INDEX "applicants_email_idx" ON "applicants"("email");

-- CreateIndex
CREATE INDEX "applicants_passportNumber_idx" ON "applicants"("passportNumber");

-- CreateIndex
CREATE INDEX "applications_organizationId_idx" ON "applications"("organizationId");

-- CreateIndex
CREATE INDEX "applications_applicantId_idx" ON "applications"("applicantId");

-- CreateIndex
CREATE INDEX "applications_templateId_idx" ON "applications"("templateId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_referenceNumber_idx" ON "applications"("referenceNumber");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_applicationId_idx" ON "audit_logs"("applicationId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "groups_organizationId_idx" ON "groups"("organizationId");

-- CreateIndex
CREATE INDEX "groups_assignedEmployeeId_idx" ON "groups"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "groups_isActive_idx" ON "groups"("isActive");

-- CreateIndex
CREATE INDEX "imports_organizationId_idx" ON "imports"("organizationId");

-- CreateIndex
CREATE INDEX "imports_groupId_idx" ON "imports"("groupId");

-- CreateIndex
CREATE INDEX "imports_status_idx" ON "imports"("status");

-- CreateIndex
CREATE INDEX "organizations_code_idx" ON "organizations"("code");

-- CreateIndex
CREATE INDEX "organizations_email_idx" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "templates_organizationId_idx" ON "templates"("organizationId");

-- CreateIndex
CREATE INDEX "templates_country_idx" ON "templates"("country");

-- CreateIndex
CREATE INDEX "templates_visaType_idx" ON "templates"("visaType");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_drafts" ADD CONSTRAINT "applicant_drafts_importId_fkey" FOREIGN KEY ("importId") REFERENCES "imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_drafts" ADD CONSTRAINT "applicant_drafts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_application_forms" ADD CONSTRAINT "visa_application_forms_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_application_forms" ADD CONSTRAINT "visa_application_forms_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_application_forms" ADD CONSTRAINT "visa_application_forms_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_pre_fill_templates" ADD CONSTRAINT "batch_pre_fill_templates_appliedByEmployeeId_fkey" FOREIGN KEY ("appliedByEmployeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_pre_fill_templates" ADD CONSTRAINT "batch_pre_fill_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_pre_fill_templates" ADD CONSTRAINT "batch_pre_fill_templates_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_visa_applications" ADD CONSTRAINT "complete_visa_applications_formDataId_fkey" FOREIGN KEY ("formDataId") REFERENCES "visa_application_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_visa_applications" ADD CONSTRAINT "complete_visa_applications_batchTemplateId_fkey" FOREIGN KEY ("batchTemplateId") REFERENCES "batch_pre_fill_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_visa_applications" ADD CONSTRAINT "complete_visa_applications_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_visa_applications" ADD CONSTRAINT "complete_visa_applications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_visa_applications" ADD CONSTRAINT "complete_visa_applications_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_visa_applications" ADD CONSTRAINT "complete_visa_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_application_documents" ADD CONSTRAINT "visa_application_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_application_documents" ADD CONSTRAINT "visa_application_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_blacklist" ADD CONSTRAINT "token_blacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
