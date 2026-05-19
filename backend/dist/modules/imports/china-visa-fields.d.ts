export interface ChinaVisaField {
    id: string;
    section: string;
    label: string;
    type: 'text' | 'date' | 'select' | 'number' | 'textarea' | 'email' | 'tel';
    required: boolean;
    options?: string[];
    placeholder?: string;
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
    ocrPatterns?: RegExp[];
    excelAliases?: string[];
}
export declare const CHINA_VISA_FIELDS: ChinaVisaField[];
export declare function getFieldsBySection(section: string): ChinaVisaField[];
export declare function getAllSections(): string[];
export declare function findFieldByExcelColumn(columnName: string): ChinaVisaField | undefined;
export declare function findFieldByOCRText(text: string): {
    field: ChinaVisaField;
    value: string;
} | null;
//# sourceMappingURL=china-visa-fields.d.ts.map