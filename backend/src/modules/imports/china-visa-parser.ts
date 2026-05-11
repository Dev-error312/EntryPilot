import { 
  CHINA_VISA_FIELDS, 
  ChinaVisaField, 
  findFieldByExcelColumn, 
  findFieldByOCRText,
  getAllSections 
} from './china-visa-fields';

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

// ==================== EXCEL PARSER ====================
export function parseExcelData(rows: any[][]): ParseResult {
  const result: ParseResult = {
    applicants: [],
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0,
    warnings: [],
  };

  if (rows.length < 2) {
    result.warnings.push('Excel file appears to be empty or has no data rows');
    return result;
  }

  // Get headers from first row
  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  
  // Map headers to fields
  const headerMapping: Map<number, ChinaVisaField> = new Map();
  headers.forEach((header, index) => {
    const field = findFieldByExcelColumn(header);
    if (field) {
      headerMapping.set(index, field);
    }
  });

  if (headerMapping.size === 0) {
    result.warnings.push('No matching columns found. Please check your Excel column headers.');
    return result;
  }

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    result.totalProcessed++;

    // Skip empty rows
    if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
      continue;
    }

    const applicant = parseExcelRow(row, headerMapping, i + 1);
    
    if (applicant.errors.length === 0 || applicant.missingRequired.length === 0) {
      result.successCount++;
    } else {
      result.errorCount++;
    }

    result.applicants.push(applicant);
  }

  return result;
}

function parseExcelRow(
  row: any[], 
  headerMapping: Map<number, ChinaVisaField>,
  rowNumber: number
): ParsedApplicant {
  const applicant: ParsedApplicant = {
    data: {},
    confidence: 100,
    fieldConfidence: {},
    missingRequired: [],
    errors: [],
    source: 'excel',
  };

  // Process each mapped column
  headerMapping.forEach((field, colIndex) => {
    const rawValue = row[colIndex];
    const { value, confidence, error } = processFieldValue(field, rawValue);
    
    applicant.data[field.id] = value;
    applicant.fieldConfidence[field.id] = confidence;
    
    if (error) {
      applicant.errors.push(`Row ${rowNumber}, ${field.label}: ${error}`);
    }
  });

  // Check required fields
  CHINA_VISA_FIELDS.forEach(field => {
    if (field.required && !applicant.data[field.id]) {
      applicant.missingRequired.push(field.label);
      applicant.fieldConfidence[field.id] = 0;
    }
  });

  // Calculate overall confidence
  const confidences = Object.values(applicant.fieldConfidence);
  applicant.confidence = confidences.length > 0 
    ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
    : 0;

  return applicant;
}

function processFieldValue(field: ChinaVisaField, rawValue: any): { 
  value: any; 
  confidence: number; 
  error?: string; 
} {
  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
    return { value: null, confidence: 0 };
  }

  const strValue = String(rawValue).trim();
  let value: any = strValue;
  let confidence = 95;

  try {
    switch (field.type) {
      case 'date':
        value = parseDate(strValue);
        if (!value) {
          return { value: null, confidence: 0, error: `Invalid date format: ${strValue}` };
        }
        break;

      case 'number':
        value = parseInt(strValue, 10);
        if (isNaN(value)) {
          return { value: null, confidence: 0, error: `Invalid number: ${strValue}` };
        }
        break;

      case 'email':
        if (!isValidEmail(strValue)) {
          confidence = 50;
        }
        value = strValue.toLowerCase();
        break;

      case 'tel':
        value = normalizePhone(strValue);
        break;

      case 'select':
        value = normalizeSelectValue(field, strValue);
        if (!value) {
          confidence = 60;
          value = strValue; // Keep original if no match
        }
        break;

      case 'text':
      case 'textarea':
        value = strValue;
        break;
    }

    // Validate if rules exist
    if (field.validation) {
      if (field.validation.minLength && String(value).length < field.validation.minLength) {
        confidence -= 20;
      }
      if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
        confidence -= 20;
      }
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(String(value))) {
        confidence -= 30;
      }
    }

    return { value, confidence: Math.max(0, Math.min(100, confidence)) };
  } catch (error) {
    return { value: strValue, confidence: 50, error: `Processing error: ${error}` };
  }
}

// ==================== PDF TEXT PARSER ====================
export function parsePDFText(text: string): ParseResult {
  const result: ParseResult = {
    applicants: [],
    totalProcessed: 1,
    successCount: 0,
    errorCount: 0,
    warnings: [],
  };

  const applicant: ParsedApplicant = {
    data: {},
    confidence: 70,
    fieldConfidence: {},
    missingRequired: [],
    errors: [],
    source: 'pdf',
  };

  // Split text into lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // Try to match each line with field patterns
  for (const line of lines) {
    const match = findFieldByOCRText(line);
    if (match) {
      applicant.data[match.field.id] = match.value;
      applicant.fieldConfidence[match.field.id] = 75;
    }
  }

  // Also try to extract common patterns from full text
  extractCommonPatterns(text, applicant);

  // Check required fields
  CHINA_VISA_FIELDS.forEach(field => {
    if (field.required && !applicant.data[field.id]) {
      applicant.missingRequired.push(field.label);
    }
  });

  // Calculate confidence
  const confidences = Object.values(applicant.fieldConfidence);
  applicant.confidence = confidences.length > 0
    ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
    : 0;

  if (applicant.missingRequired.length === 0) {
    result.successCount++;
  } else {
    result.errorCount++;
  }

  result.applicants.push(applicant);
  return result;
}

// ==================== OCR IMAGE PARSER ====================
export function parseOCRText(text: string): ParseResult {
  // OCR parsing is similar to PDF but with lower confidence
  const result = parsePDFText(text);
  
  // Adjust confidence for OCR (typically less accurate)
  result.applicants.forEach(applicant => {
    applicant.source = 'ocr';
    applicant.confidence = Math.max(0, applicant.confidence - 20);
    
    // Lower field confidence
    Object.keys(applicant.fieldConfidence).forEach(key => {
      applicant.fieldConfidence[key] = Math.max(0, applicant.fieldConfidence[key] - 15);
    });
  });

  return result;
}

// ==================== HELPER FUNCTIONS ====================

function parseDate(value: string): string | null {
  // Try multiple date formats
  const formats = [
    // YYYY-MM-DD or YYYY/MM/DD
    /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/,
    // DD-MM-YYYY or DD/MM/YYYY
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/,
    // MM-DD-YYYY or MM/DD/YYYY
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/,
    // DD.MM.YYYY
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
  ];

  // Try YYYY-MM-DD first
  let match = value.match(formats[0]);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  }

  // Try DD-MM-YYYY (assume European format)
  match = value.match(formats[1]);
  if (match) {
    const [, day, month, year] = match;
    // Validate
    const d = parseInt(day);
    const m = parseInt(month);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Try to parse with Date
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(phone: string): string {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Keep leading + for international format
  if (phone.startsWith('+')) {
    normalized = '+' + normalized.replace(/\+/g, '');
  }
  
  return normalized;
}

function normalizeSelectValue(field: ChinaVisaField, value: string): string | null {
  if (!field.options) return value;
  
  const normalized = value.toLowerCase().trim();
  
  // Exact match
  const exactMatch = field.options.find(o => o.toLowerCase() === normalized);
  if (exactMatch) return exactMatch;
  
  // Partial match
  const partialMatch = field.options.find(o => 
    o.toLowerCase().includes(normalized) || 
    normalized.includes(o.toLowerCase())
  );
  if (partialMatch) return partialMatch;
  
  // Special cases
  if (field.id === 'sex' || field.id === 'gender') {
    if (['m', 'male', 'man', 'boy'].includes(normalized)) return 'Male';
    if (['f', 'female', 'woman', 'girl'].includes(normalized)) return 'Female';
  }
  
  if (['yes', 'y', 'true', '1'].includes(normalized)) return 'Yes';
  if (['no', 'n', 'false', '0'].includes(normalized)) return 'No';
  
  return null;
}

function extractCommonPatterns(text: string, applicant: ParsedApplicant): void {
  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (emailMatch && !applicant.data.email) {
    applicant.data.email = emailMatch[0].toLowerCase();
    applicant.fieldConfidence.email = 80;
  }

  // Extract phone numbers
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  if (phoneMatch && !applicant.data.phone_number) {
    applicant.data.phone_number = phoneMatch[0];
    applicant.fieldConfidence.phone_number = 75;
  }

  // Extract passport-like patterns (2 letters followed by 6-9 digits)
  const passportMatch = text.match(/\b[A-Z]{2}\d{6,9}\b/);
  if (passportMatch && !applicant.data.passport_number) {
    applicant.data.passport_number = passportMatch[0];
    applicant.fieldConfidence.passport_number = 70;
  }

  // Extract date patterns and try to assign
  const datePattern = /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/g;
  const dates = text.match(datePattern);
  if (dates) {
    dates.forEach(date => {
      const parsed = parseDate(date);
      if (parsed) {
        // Try to determine what kind of date this is based on context
        const contextStart = Math.max(0, text.indexOf(date) - 50);
        const contextEnd = Math.min(text.length, text.indexOf(date) + 50);
        const context = text.slice(contextStart, contextEnd).toLowerCase();

        if (context.includes('birth') && !applicant.data.date_of_birth) {
          applicant.data.date_of_birth = parsed;
          applicant.fieldConfidence.date_of_birth = 70;
        } else if (context.includes('issue') && !applicant.data.passport_issue_date) {
          applicant.data.passport_issue_date = parsed;
          applicant.fieldConfidence.passport_issue_date = 70;
        } else if (context.includes('expir') && !applicant.data.passport_expiry_date) {
          applicant.data.passport_expiry_date = parsed;
          applicant.fieldConfidence.passport_expiry_date = 70;
        } else if (context.includes('entry') && !applicant.data.intended_entry_date) {
          applicant.data.intended_entry_date = parsed;
          applicant.fieldConfidence.intended_entry_date = 70;
        }
      }
    });
  }
}

// ==================== VALIDATION ====================
export function validateApplicantData(data: Record<string, any>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  CHINA_VISA_FIELDS.forEach(field => {
    const value = data[field.id];

    // Check required
    if (field.required && !value) {
      errors.push(`${field.label} is required`);
      return;
    }

    if (!value) return;

    // Type validation
    switch (field.type) {
      case 'email':
        if (!isValidEmail(String(value))) {
          errors.push(`${field.label}: Invalid email format`);
        }
        break;

      case 'date':
        if (!parseDate(String(value))) {
          errors.push(`${field.label}: Invalid date format`);
        }
        break;

      case 'select':
        if (field.options && !field.options.includes(String(value))) {
          warnings.push(`${field.label}: "${value}" is not a standard option`);
        }
        break;
    }

    // Custom validation
    if (field.validation) {
      const strValue = String(value);
      if (field.validation.minLength && strValue.length < field.validation.minLength) {
        errors.push(`${field.label}: Must be at least ${field.validation.minLength} characters`);
      }
      if (field.validation.maxLength && strValue.length > field.validation.maxLength) {
        errors.push(`${field.label}: Must be at most ${field.validation.maxLength} characters`);
      }
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(strValue)) {
        errors.push(`${field.label}: Invalid format`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ==================== TRANSFORM TO APPLICANT ====================
export function transformToApplicant(data: Record<string, any>, groupId: string): {
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
} {
  return {
    firstName: data.given_name || '',
    lastName: data.surname || '',
    email: data.email || null,
    phone: data.phone_number || null,
    dob: data.date_of_birth || null,
    gender: data.sex || '',
    nationality: data.current_nationality || '',
    passportNumber: data.passport_number || '',
    passportIssue: data.passport_issue_date || null,
    passportExpiry: data.passport_expiry_date || null,
    address: data.residential_address || '',
    documents: {
      chinaVisaForm: data,
      parsedAt: new Date().toISOString(),
    },
  };
}
