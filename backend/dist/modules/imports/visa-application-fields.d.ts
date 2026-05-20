/**
 * Visa Application Fields Mapping
 * Maps Excel columns and PDF fields to the VisaApplicationForm schema
 */
export interface VisaField {
    id: string;
    name: string;
    label: string;
    section: string;
    type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'file' | 'textarea' | 'number' | 'json';
    required: boolean;
    excelColumns: string[];
    pdfFieldNames: string[];
    format?: string;
    examples?: string[];
    options?: string[];
    maxLength?: number;
    pattern?: RegExp;
}
export declare const VISA_APPLICATION_FIELDS: VisaField[];
export declare function findFieldByExcelColumn(headerText: string): VisaField | null;
export declare function findFieldByPDFField(pdfFieldName: string): VisaField | null;
export declare function getFieldsBySection(section: string): VisaField[];
export declare function getRequiredFields(): VisaField[];
export declare function getAllSections(): string[];
export declare function formatFieldValue(field: VisaField, value: any): any;
//# sourceMappingURL=visa-application-fields.d.ts.map