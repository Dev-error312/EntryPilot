export declare class VisaDocumentService {
    create(data: any, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        status: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        mimeType: string;
        documentCategory: string;
        documentType: string;
        associatedWith: string | null;
        uploadedBy: string;
    }>;
    getDocuments(applicationId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        status: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        mimeType: string;
        documentCategory: string;
        documentType: string;
        associatedWith: string | null;
        uploadedBy: string;
    }[]>;
    deleteDocument(id: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        status: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        mimeType: string;
        documentCategory: string;
        documentType: string;
        associatedWith: string | null;
        uploadedBy: string;
    }>;
    updateDocumentStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        status: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        mimeType: string;
        documentCategory: string;
        documentType: string;
        associatedWith: string | null;
        uploadedBy: string;
    }>;
}
export declare const visaDocumentService: VisaDocumentService;
//# sourceMappingURL=visa-document.service.d.ts.map