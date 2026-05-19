import { FastifyInstance } from 'fastify';
export interface ApplicantDraft {
    id: string;
    importId: string;
    extractedData: Record<string, any>;
    confidence: number;
    fieldConfidence: Record<string, number>;
    status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CORRECTED';
    corrections?: Record<string, any>;
    originalSource?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ReviewStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    corrected: number;
    averageConfidence: number;
}
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
export declare class ApplicantDraftService {
    private server;
    constructor(server: FastifyInstance);
    /**
     * Create drafts from parsed applicants
     * Called after file processing, before applicant creation
     */
    createDrafts(importId: string, organizationId: string, groupId: string, parsedApplicants: any[]): Promise<ApplicantDraft[]>;
    /**
     * Get all drafts for an import
     */
    getDrafts(importId: string, organizationId: string, filters?: {
        status?: string;
        minConfidence?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        drafts: ApplicantDraft[];
        total: number;
    }>;
    /**
     * Get single draft
     */
    getDraft(draftId: string, organizationId: string): Promise<ApplicantDraft | null>;
    /**
     * Update draft with user corrections
     */
    updateDraft(draftId: string, organizationId: string, corrections: Record<string, any>, userId?: string): Promise<ApplicantDraft>;
    /**
     * Approve single draft → create applicant
     */
    approveDraft(draftId: string, organizationId: string, groupId: string, userId: string): Promise<{
        applicant: any;
        draft: ApplicantDraft;
    }>;
    /**
     * Reject draft (don't create applicant)
     */
    rejectDraft(draftId: string, organizationId: string, userId: string, reason?: string): Promise<ApplicantDraft>;
    /**
     * Approve all pending drafts and create applicants
     * Used when user approves entire import batch
     */
    approveAll(importId: string, organizationId: string, groupId: string, userId: string): Promise<{
        created: number;
        failed: number;
        results: Array<{
            success: boolean;
            draftId: string;
            error?: string;
        }>;
    }>;
    /**
     * Get review statistics for import
     */
    getReviewStats(importId: string, organizationId: string): Promise<ReviewStats>;
    /**
     * Delete all drafts for an import
     */
    deleteDrafts(importId: string, organizationId: string): Promise<number>;
    /**
     * Check for duplicate applicants before approval
     */
    checkDuplicates(draftId: string, organizationId: string): Promise<{
        hasDuplicates: boolean;
        duplicates: Array<{
            field: string;
            value: string;
            existingApplicantId: string;
        }>;
    }>;
}
//# sourceMappingURL=applicant-draft.service.d.ts.map