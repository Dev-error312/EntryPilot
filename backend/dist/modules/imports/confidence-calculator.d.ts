/**
 * Calculates confidence scores for extracted fields and applicants
 * Factors:
 * - Field presence (0-100)
 * - Value type match (0-100)
 * - OCR confidence if applicable (0-100)
 * - Data completeness (0-100)
 * - Format validation (0-100)
 */
export declare class ConfidenceCalculator {
    /**
     * Calculate confidence for a single field
     * Returns 0-100 score
     */
    calculateFieldConfidence(fieldName: string, value: any, ocrConfidence?: number, source?: 'excel' | 'pdf' | 'ocr'): number;
    /**
     * Calculate overall applicant confidence
     * Average of all field confidences, weighted by importance
     */
    calculateApplicantConfidence(applicant: Record<string, any>, fieldConfidences: Record<string, number>): number;
    /**
     * Get field requirements and validation rules
     */
    getFieldRequirements(fieldName: string): {
        required: boolean;
        type: string;
        format?: string;
        examples?: string[];
    };
    /**
     * Validate if value matches expected field format
     */
    validateFieldFormat(fieldName: string, value: any): boolean;
    /**
     * Get regex for field format validation
     */
    private getFormatRegex;
    /**
     * Validate date format
     */
    private isValidDate;
    /**
     * Validate email format
     */
    private isValidEmail;
    /**
     * Validate phone format
     */
    private isValidPhone;
    /**
     * Check if field is required but missing
     */
    isRequiredFieldMissing(fieldName: string, value: any): boolean;
    /**
     * Get all required fields that are missing
     */
    getMissingRequiredFields(applicant: Record<string, any>): string[];
    /**
     * Calculate data completeness percentage
     * How many required fields are present
     */
    getCompletenessScore(applicant: Record<string, any>): number;
}
export declare const confidenceCalculator: ConfidenceCalculator;
//# sourceMappingURL=confidence-calculator.d.ts.map