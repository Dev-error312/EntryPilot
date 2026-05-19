export interface ParsedApplicant {
    data: Record<string, any>;
    confidence: number;
    fieldConfidence: Record<string, number>;
    missingRequired: string[];
    errors: string[];
    source: 'excel' | 'pdf' | 'ocr';
}
export interface ParseResult {
    applicants: ParsedApplicant[];
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    warnings: string[];
}
export declare function parseExcelData(rows: any[][]): ParseResult;
export declare function parsePDFText(text: string): ParseResult;
export declare function parseOCRText(text: string): ParseResult;
export declare function validateApplicantData(data: Record<string, any>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
export declare function transformToApplicant(data: Record<string, any>, groupId: string): {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string | null;
    gender: string;
    nationality: string;
    passportNumber: string;
    passportIssue: string | null;
    passportExpiry: string | null;
    address: string;
    documents: any;
};
//# sourceMappingURL=china-visa-parser.d.ts.map