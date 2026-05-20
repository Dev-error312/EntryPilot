"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confidenceCalculator = exports.ConfidenceCalculator = void 0;
const china_visa_fields_1 = require("./china-visa-fields");
/**
 * Calculates confidence scores for extracted fields and applicants
 * Factors:
 * - Field presence (0-100)
 * - Value type match (0-100)
 * - OCR confidence if applicable (0-100)
 * - Data completeness (0-100)
 * - Format validation (0-100)
 */
class ConfidenceCalculator {
    /**
     * Calculate confidence for a single field
     * Returns 0-100 score
     */
    calculateFieldConfidence(fieldName, value, ocrConfidence, source) {
        // No value = 0% confidence
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        // Find field definition
        const field = china_visa_fields_1.CHINA_VISA_FIELDS.find(f => f.id === fieldName);
        if (!field)
            return 50; // Unknown field
        let confidence = 50; // Base score
        // Value presence bonus (+25)
        confidence += 25;
        // Type match bonus (+25)
        if (this.validateFieldFormat(fieldName, value)) {
            confidence += 25;
        }
        // OCR confidence factor (0-100 → scale to 0-25)
        if (ocrConfidence !== undefined && source === 'ocr') {
            const ocrFactor = (ocrConfidence / 100) * 25;
            confidence = confidence - 25 + ocrFactor;
        }
        // Excel/PDF sources get full confidence if valid (+25 already applied)
        // OCR gets OCR confidence factored in
        return Math.min(100, Math.max(0, confidence));
    }
    /**
     * Calculate overall applicant confidence
     * Average of all field confidences, weighted by importance
     */
    calculateApplicantConfidence(applicant, fieldConfidences) {
        const criticalFields = [
            'firstName',
            'lastName',
            'passportNumber',
            'passportExpiry'
        ];
        let totalConfidence = 0;
        let totalWeight = 0;
        for (const [fieldName, confidence] of Object.entries(fieldConfidences)) {
            // Critical fields get 2x weight
            const weight = criticalFields.includes(fieldName) ? 2 : 1;
            totalConfidence += confidence * weight;
            totalWeight += weight;
        }
        if (totalWeight === 0)
            return 0;
        return Math.round(totalConfidence / totalWeight);
    }
    /**
     * Get field requirements and validation rules
     */
    getFieldRequirements(fieldName) {
        const field = china_visa_fields_1.CHINA_VISA_FIELDS.find(f => f.id === fieldName);
        if (!field) {
            return {
                required: false,
                type: 'string'
            };
        }
        return {
            required: field.required || false,
            type: field.type || 'string',
            format: field.format,
            examples: field.examples
        };
    }
    /**
     * Validate if value matches expected field format
     */
    validateFieldFormat(fieldName, value) {
        const field = china_visa_fields_1.CHINA_VISA_FIELDS.find(f => f.id === fieldName);
        if (!field)
            return true;
        const stringValue = String(value).trim();
        const fieldType = field.type;
        // Format validation
        if (field.format && fieldType === 'string') {
            const regex = this.getFormatRegex(field.format);
            if (regex && !regex.test(stringValue)) {
                return false;
            }
        }
        // Type validation
        switch (fieldType) {
            case 'date':
                return this.isValidDate(stringValue);
            case 'email':
                return this.isValidEmail(stringValue);
            case 'phone':
            case 'tel':
                return this.isValidPhone(stringValue);
            case 'number':
                return !isNaN(parseFloat(stringValue));
            case 'string':
            case 'text':
            case 'textarea':
            case 'select':
                return stringValue.length > 0;
            default:
                return true;
        }
    }
    /**
     * Get regex for field format validation
     */
    getFormatRegex(format) {
        const formatMap = {
            'passport': /^[A-Z0-9]{6,12}$/i,
            'date': /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/,
            'phone': /^\+?[0-9\s\-\(\)]{7,}$/,
            'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'zipcode': /^\d{4,6}$/,
            'id': /^[A-Z0-9]{6,12}$/i
        };
        return formatMap[format] || null;
    }
    /**
     * Validate date format
     */
    isValidDate(value) {
        // Try multiple date formats
        const formats = [
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
        ];
        if (!formats.some(f => f.test(value))) {
            return false;
        }
        try {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        catch {
            return false;
        }
    }
    /**
     * Validate email format
     */
    isValidEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) && value.length <= 254;
    }
    /**
     * Validate phone format
     */
    isValidPhone(value) {
        // Remove common formatting
        const cleaned = value.replace(/[\s\-\(\)\.]/g, '');
        // At least 7 digits, up to 15
        return /^[+]?[0-9]{7,15}$/.test(cleaned);
    }
    /**
     * Check if field is required but missing
     */
    isRequiredFieldMissing(fieldName, value) {
        const field = china_visa_fields_1.CHINA_VISA_FIELDS.find(f => f.id === fieldName);
        if (!field || !field.required)
            return false;
        return !value || String(value).trim() === '';
    }
    /**
     * Get all required fields that are missing
     */
    getMissingRequiredFields(applicant) {
        return china_visa_fields_1.CHINA_VISA_FIELDS
            .filter(field => field.required)
            .filter(field => {
            const value = applicant[field.id];
            return !value || String(value).trim() === '';
        })
            .map(field => field.id);
    }
    /**
     * Calculate data completeness percentage
     * How many required fields are present
     */
    getCompletenessScore(applicant) {
        const requiredFields = china_visa_fields_1.CHINA_VISA_FIELDS.filter(f => f.required);
        if (requiredFields.length === 0)
            return 100;
        const presentFields = requiredFields.filter(field => {
            const value = applicant[field.id];
            return value && String(value).trim() !== '';
        });
        return Math.round((presentFields.length / requiredFields.length) * 100);
    }
}
exports.ConfidenceCalculator = ConfidenceCalculator;
exports.confidenceCalculator = new ConfidenceCalculator();
//# sourceMappingURL=confidence-calculator.js.map