export declare class VisaMergerService {
    mergeFormAndTemplate(formId: string, templateId?: string, organizationId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        referenceNumber: string;
        visaType: string | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        rejectionReason: string | null;
        applicantId: string | null;
        groupId: string;
        reviewedAt: Date | null;
        inviterFullName: string | null;
        inviterPhone: string | null;
        inviterEmail: string | null;
        purposeOfVisit: string | null;
        intendedArrivalDate: Date | null;
        intendedDepartureDate: Date | null;
        ticketReceiptIds: string | null;
        hotelBookingIds: string | null;
        itineraryIds: string | null;
        invitationLetterIds: string | null;
        applicantFullName: string;
        applicantEmail: string | null;
        applicantPhone: string | null;
        applicantDOB: Date | null;
        inviterCompany: string | null;
        formDataId: string;
        batchTemplateId: string | null;
        reviewedByUserId: string | null;
    }>;
}
export declare const visaMergerService: VisaMergerService;
//# sourceMappingURL=visa-merger.service.d.ts.map