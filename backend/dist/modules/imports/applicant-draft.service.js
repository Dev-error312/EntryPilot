"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantDraftService = void 0;
const visa_application_fields_1 = require("./visa-application-fields");
/**
 * Applicant Draft Service
 * Manages the manual correction queue for imported applicants
 *
 * Workflow:
 * 1. Import file → create drafts (extracted data in staging)
 * 2. User reviews drafts (/drafts endpoint)
 * 3. User corrects any fields if needed (/drafts/:id PUT)
 * 4. User approves (batch or single) (/approve endpoint)
 * 5. Drafts converted to actual applicants
 * 6. Files moved to archives
 */
class ApplicantDraftService {
    constructor(server) {
        this.server = server;
    }
    /**
     * Create drafts from parsed applicants
     * Called after file processing, before applicant creation
     */
    async createDrafts(importId, organizationId, groupId, parsedApplicants) {
        const createdDrafts = [];
        for (const parsed of parsedApplicants) {
            const draft = await this.server.prisma.applicantDraft.create({
                data: {
                    importId,
                    organizationId,
                    extractedData: parsed.data,
                    confidence: parsed.confidence || 0,
                    fieldConfidence: parsed.fieldConfidence || {},
                    status: 'PENDING_REVIEW',
                    originalSource: parsed.source || 'unknown'
                }
            });
            createdDrafts.push(draft);
        }
        return createdDrafts;
    }
    /**
     * Get all drafts for an import
     */
    async getDrafts(importId, organizationId, filters) {
        const { status, minConfidence, page = 1, limit = 20 } = filters || {};
        const where = {
            importId,
            organizationId
        };
        if (status)
            where.status = status;
        if (minConfidence !== undefined) {
            where.confidence = { gte: minConfidence };
        }
        const [drafts, total] = await Promise.all([
            this.server.prisma.applicantDraft.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { confidence: 'desc' }
            }),
            this.server.prisma.applicantDraft.count({ where })
        ]);
        return { drafts: drafts, total };
    }
    /**
     * Get single draft
     */
    async getDraft(draftId, organizationId) {
        const draft = await this.server.prisma.applicantDraft.findFirst({
            where: {
                id: draftId,
                organizationId
            }
        });
        return draft;
    }
    /**
     * Update draft with user corrections
     */
    async updateDraft(draftId, organizationId, corrections, userId) {
        // Merge corrections with extracted data
        const existing = await this.getDraft(draftId, organizationId);
        if (!existing)
            throw new Error('Draft not found');
        // Merge: extracted data + corrections
        const mergedData = {
            ...existing.extractedData,
            ...corrections
        };
        const updated = await this.server.prisma.applicantDraft.update({
            where: { id: draftId },
            data: {
                extractedData: mergedData,
                corrections: corrections,
                status: 'CORRECTED',
                reviewedBy: userId,
                reviewedAt: new Date()
            }
        });
        return updated;
    }
    /**
     * Approve single draft → create applicant
     */
    async approveDraft(draftId, organizationId, groupId, userId) {
        const draft = await this.getDraft(draftId, organizationId);
        if (!draft)
            throw new Error('Draft not found');
        // Use merged data (corrections + extracted)
        const finalData = {
            ...draft.extractedData,
            ...(draft.corrections || {})
        };
        let applicant;
        await this.server.prisma.$transaction(async (tx) => {
            // Create applicant
            applicant = await tx.applicant.create({
                data: {
                    firstName: finalData.firstName || 'Unknown',
                    lastName: finalData.lastName || 'Unknown',
                    email: finalData.email,
                    phone: finalData.phone,
                    dob: finalData.dob ? new Date(finalData.dob) : null,
                    gender: finalData.gender,
                    nationality: finalData.nationality,
                    passportNumber: finalData.passportNumber,
                    passportIssue: finalData.passportIssue ? new Date(finalData.passportIssue) : null,
                    passportExpiry: finalData.passportExpiry ? new Date(finalData.passportExpiry) : null,
                    address: finalData.address,
                    groupId,
                    organizationId,
                    documents: {
                        ...finalData.documents,
                        draftId,
                        source: draft.originalSource,
                        confidence: draft.confidence
                    }
                }
            });
            // Create visa application form from draft data so it's submission-ready
            try {
                const visaPayload = {
                    organizationId,
                    groupId,
                    applicantId: applicant.id,
                    status: 'READY'
                };
                // Map fields using VISA_APPLICATION_FIELDS
                for (const field of visa_application_fields_1.VISA_APPLICATION_FIELDS) {
                    const raw = finalData[field.id] ?? finalData[field.name] ?? null;
                    if (raw === undefined || raw === null)
                        continue;
                    // Skip file fields here (handled as documents)
                    if (field.type === 'file')
                        continue;
                    visaPayload[field.name] = (0, visa_application_fields_1.formatFieldValue)(field, raw);
                }
                // Fallback mappings from parser-style keys
                if (!visaPayload.placeOfBirthCountry && finalData.place_of_birth_country) {
                    visaPayload.placeOfBirthCountry = finalData.place_of_birth_country;
                }
                if (!visaPayload.placeOfBirthProvince && finalData.place_of_birth_province) {
                    visaPayload.placeOfBirthProvince = finalData.place_of_birth_province;
                }
                if (!visaPayload.placeOfBirthCity && finalData.place_of_birth_city) {
                    visaPayload.placeOfBirthCity = finalData.place_of_birth_city;
                }
                if (!visaPayload.maritalStatus && finalData.marital_status) {
                    visaPayload.maritalStatus = finalData.marital_status;
                }
                if (!visaPayload.currentOccupation && finalData.occupation) {
                    visaPayload.currentOccupation = finalData.occupation;
                }
                if (!visaPayload.companyName && finalData.employer_name) {
                    visaPayload.companyName = finalData.employer_name;
                }
                if (!visaPayload.companyPhone && finalData.employer_phone) {
                    visaPayload.companyPhone = finalData.employer_phone;
                }
                if (!visaPayload.companyAddress && finalData.employer_address) {
                    visaPayload.companyAddress = finalData.employer_address;
                }
                if (!visaPayload.residenceStreet && finalData.residential_address) {
                    visaPayload.residenceStreet = finalData.residential_address;
                }
                if (!visaPayload.residenceMobilePhone && finalData.phone_number) {
                    visaPayload.residenceMobilePhone = finalData.phone_number;
                }
                if (!visaPayload.residenceEmail && finalData.email) {
                    visaPayload.residenceEmail = finalData.email;
                }
                if (!visaPayload.residenceCountry && finalData.current_nationality) {
                    visaPayload.residenceCountry = finalData.current_nationality;
                }
                if (!visaPayload.formerNationality && finalData.former_nationality) {
                    visaPayload.formerNationality = finalData.former_nationality;
                }
                if (!visaPayload.emergencyFirstName && finalData.emergency_contact_name) {
                    const parts = String(finalData.emergency_contact_name).split(/\s+/);
                    visaPayload.emergencyFirstName = parts.shift() || null;
                    visaPayload.emergencyLastName = parts.join(' ') || null;
                }
                if (!visaPayload.emergencyPhone && finalData.emergency_contact_phone) {
                    visaPayload.emergencyPhone = finalData.emergency_contact_phone;
                }
                if (!visaPayload.emergencyRelationship && finalData.emergency_contact_relationship) {
                    visaPayload.emergencyRelationship = finalData.emergency_contact_relationship;
                }
                // Ensure required fields for visa form record
                if (!visaPayload.fullName) {
                    visaPayload.fullName = `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown Applicant';
                }
                await tx.visaApplicationForm.create({ data: visaPayload });
            }
            catch (err) {
                // Don't fail the whole transaction if visa form creation fails; record audit
                await tx.auditLog.create({
                    data: {
                        action: 'VISA_FORM_CREATE_FAILED',
                        entityType: 'ApplicantDraft',
                        entityId: draftId,
                        newValues: { error: String(err) },
                        userId,
                        organizationId
                    }
                });
            }
            // Update draft status
            await tx.applicantDraft.update({
                where: { id: draftId },
                data: {
                    status: 'APPROVED',
                    reviewedBy: userId,
                    reviewedAt: new Date()
                }
            });
            // Audit log
            await tx.auditLog.create({
                data: {
                    action: 'APPROVE_IMPORT_DRAFT',
                    entityType: 'Applicant',
                    entityId: applicant.id,
                    newValues: {
                        name: `${applicant.firstName} ${applicant.lastName}`,
                        source: draft.originalSource,
                        confidence: draft.confidence
                    },
                    userId,
                    organizationId
                }
            });
        });
        // Reload updated draft
        const updatedDraft = await this.getDraft(draftId, organizationId);
        return {
            applicant,
            draft: updatedDraft
        };
    }
    /**
     * Reject draft (don't create applicant)
     */
    async rejectDraft(draftId, organizationId, userId, reason) {
        const draft = await this.server.prisma.applicantDraft.update({
            where: { id: draftId },
            data: {
                status: 'REJECTED',
                reviewedBy: userId,
                reviewedAt: new Date(),
                corrections: reason ? { rejectionReason: reason } : undefined
            }
        });
        // Audit log
        await this.server.prisma.auditLog.create({
            data: {
                action: 'REJECT_IMPORT_DRAFT',
                entityType: 'ApplicantDraft',
                entityId: draftId,
                newValues: { reason },
                userId,
                organizationId
            }
        });
        return draft;
    }
    /**
     * Approve all pending drafts and create applicants
     * Used when user approves entire import batch
     */
    async approveAll(importId, organizationId, groupId, userId) {
        const { drafts } = await this.getDrafts(importId, organizationId, {
            status: 'PENDING_REVIEW'
        });
        const results = [];
        let created = 0;
        let failed = 0;
        for (const draft of drafts) {
            try {
                await this.approveDraft(draft.id, organizationId, groupId, userId);
                results.push({ success: true, draftId: draft.id });
                created++;
            }
            catch (error) {
                results.push({
                    success: false,
                    draftId: draft.id,
                    error: error.message
                });
                failed++;
            }
        }
        return { created, failed, results };
    }
    /**
     * Get review statistics for import
     */
    async getReviewStats(importId, organizationId) {
        const [total, pending, approved, rejected, corrected] = await Promise.all([
            this.server.prisma.applicantDraft.count({
                where: { importId, organizationId }
            }),
            this.server.prisma.applicantDraft.count({
                where: { importId, organizationId, status: 'PENDING_REVIEW' }
            }),
            this.server.prisma.applicantDraft.count({
                where: { importId, organizationId, status: 'APPROVED' }
            }),
            this.server.prisma.applicantDraft.count({
                where: { importId, organizationId, status: 'REJECTED' }
            }),
            this.server.prisma.applicantDraft.count({
                where: { importId, organizationId, status: 'CORRECTED' }
            })
        ]);
        // Get average confidence
        const drafts = await this.server.prisma.applicantDraft.findMany({
            where: { importId, organizationId },
            select: { confidence: true }
        });
        const avgConfidence = drafts.length > 0
            ? Math.round(drafts.reduce((sum, d) => sum + d.confidence, 0) / drafts.length)
            : 0;
        return {
            total,
            pending,
            approved,
            rejected,
            corrected,
            averageConfidence: avgConfidence
        };
    }
    /**
     * Delete all drafts for an import
     */
    async deleteDrafts(importId, organizationId) {
        const result = await this.server.prisma.applicantDraft.deleteMany({
            where: { importId, organizationId }
        });
        return result.count;
    }
    /**
     * Check for duplicate applicants before approval
     */
    async checkDuplicates(draftId, organizationId) {
        const draft = await this.getDraft(draftId, organizationId);
        if (!draft)
            throw new Error('Draft not found');
        const duplicates = [];
        // Check passport uniqueness
        if (draft.extractedData.passportNumber) {
            const existing = await this.server.prisma.applicant.findFirst({
                where: {
                    passportNumber: draft.extractedData.passportNumber,
                    organizationId
                }
            });
            if (existing) {
                duplicates.push({
                    field: 'passportNumber',
                    value: draft.extractedData.passportNumber,
                    existingApplicantId: existing.id
                });
            }
        }
        // Check email uniqueness
        if (draft.extractedData.email) {
            const existing = await this.server.prisma.applicant.findFirst({
                where: {
                    email: draft.extractedData.email,
                    organizationId
                }
            });
            if (existing) {
                duplicates.push({
                    field: 'email',
                    value: draft.extractedData.email,
                    existingApplicantId: existing.id
                });
            }
        }
        return {
            hasDuplicates: duplicates.length > 0,
            duplicates
        };
    }
}
exports.ApplicantDraftService = ApplicantDraftService;
//# sourceMappingURL=applicant-draft.service.js.map