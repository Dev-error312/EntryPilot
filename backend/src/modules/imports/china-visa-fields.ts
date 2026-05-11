// China Visa Application Form V.2013 - Complete Field Definitions
// Based on official Chinese consulate requirements

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
  ocrPatterns?: RegExp[]; // Patterns to match in OCR
  excelAliases?: string[]; // Alternative column names in Excel
}

// All fields from China Visa Form V.2013
export const CHINA_VISA_FIELDS: ChinaVisaField[] = [
  // ==================== SECTION 1: PERSONAL INFORMATION ====================
  {
    id: 'surname',
    section: 'personal',
    label: 'Surname (Last Name)',
    type: 'text',
    required: true,
    placeholder: 'As shown in passport',
    ocrPatterns: [
      /(?:surname|last\s*name|family\s*name)[:\s]*([A-Z]+)/i,
      /1\.1[:\s]*([A-Z]+)/i,
    ],
    excelAliases: ['surname', 'last_name', 'family_name', 'lastname'],
  },
  {
    id: 'given_name',
    section: 'personal',
    label: 'Given Name (First Name)',
    type: 'text',
    required: true,
    placeholder: 'As shown in passport',
    ocrPatterns: [
      /(?:given\s*name|first\s*name)[:\s]*([A-Z]+)/i,
      /1\.2[:\s]*([A-Z]+)/i,
    ],
    excelAliases: ['given_name', 'first_name', 'firstname', 'first'],
  },
  {
    id: 'middle_name',
    section: 'personal',
    label: 'Middle Name',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:middle\s*name)[:\s]*([A-Z]*)/i,
      /1\.3[:\s]*([A-Z]*)/i,
    ],
    excelAliases: ['middle_name', 'middlename'],
  },
  {
    id: 'chinese_name',
    section: 'personal',
    label: 'Chinese Name (if any)',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:chinese\s*name|中文名)[:\s]*(.*)/i,
      /1\.4[:\s]*(.*)/i,
    ],
    excelAliases: ['chinese_name', 'name_chinese'],
  },
  {
    id: 'sex',
    section: 'personal',
    label: 'Sex / Gender',
    type: 'select',
    required: true,
    options: ['Male', 'Female'],
    ocrPatterns: [
      /(?:sex|gender)[:\s]*(male|female|m|f)/i,
      /1\.5[:\s]*(male|female|m|f)/i,
    ],
    excelAliases: ['sex', 'gender'],
  },
  {
    id: 'date_of_birth',
    section: 'personal',
    label: 'Date of Birth',
    type: 'date',
    required: true,
    ocrPatterns: [
      /(?:date\s*of\s*birth|dob|birth\s*date|born)[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
      /1\.6[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
      /(\d{2}[-\/]\d{2}[-\/]\d{4})/,
    ],
    excelAliases: ['date_of_birth', 'dob', 'birth_date', 'birthday', 'born'],
  },
  {
    id: 'current_nationality',
    section: 'personal',
    label: 'Current Nationality',
    type: 'text',
    required: true,
    ocrPatterns: [
      /(?:current\s*nationality|nationality|citizenship)[:\s]*([A-Za-z\s]+)/i,
      /1\.7[:\s]*([A-Za-z\s]+)/i,
    ],
    excelAliases: ['nationality', 'current_nationality', 'citizenship', 'country'],
  },
  {
    id: 'former_nationality',
    section: 'personal',
    label: 'Former Nationality (if any)',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:former\s*nationality|previous\s*nationality)[:\s]*([A-Za-z\s]*)/i,
      /1\.8[:\s]*([A-Za-z\s]*)/i,
    ],
    excelAliases: ['former_nationality', 'previous_nationality'],
  },
  {
    id: 'place_of_birth_city',
    section: 'personal',
    label: 'Place of Birth - City',
    type: 'text',
    required: true,
    ocrPatterns: [
      /(?:place\s*of\s*birth|birth\s*place)[:\s]*([^,]+)/i,
      /1\.9[:\s]*([^,]+)/i,
    ],
    excelAliases: ['birth_city', 'place_of_birth_city', 'city_of_birth'],
  },
  {
    id: 'place_of_birth_province',
    section: 'personal',
    label: 'Place of Birth - Province/State',
    type: 'text',
    required: false,
    excelAliases: ['birth_province', 'place_of_birth_province', 'state_of_birth'],
  },
  {
    id: 'place_of_birth_country',
    section: 'personal',
    label: 'Place of Birth - Country',
    type: 'text',
    required: true,
    excelAliases: ['birth_country', 'place_of_birth_country', 'country_of_birth'],
  },
  {
    id: 'id_number',
    section: 'personal',
    label: 'ID / Citizenship Number',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:id\s*number|citizenship\s*number|national\s*id)[:\s]*([A-Z0-9]+)/i,
      /1\.10[:\s]*([A-Z0-9]+)/i,
    ],
    excelAliases: ['id_number', 'national_id', 'citizenship_number'],
  },

  // ==================== PASSPORT INFORMATION ====================
  {
    id: 'passport_type',
    section: 'passport',
    label: 'Passport Type',
    type: 'select',
    required: true,
    options: ['Ordinary', 'Diplomatic', 'Service', 'Official', 'Other'],
    ocrPatterns: [
      /(?:passport\s*type|travel\s*document\s*type)[:\s]*(ordinary|diplomatic|service|official)/i,
      /1\.11[:\s]*(ordinary|diplomatic|service|official)/i,
    ],
    excelAliases: ['passport_type'],
  },
  {
    id: 'passport_number',
    section: 'passport',
    label: 'Passport Number',
    type: 'text',
    required: true,
    validation: {
      minLength: 6,
      maxLength: 15,
      pattern: '^[A-Z0-9]+$',
    },
    ocrPatterns: [
      /(?:passport\s*(?:number|no|num|#))[:\s]*([A-Z0-9]{6,15})/i,
      /1\.12[:\s]*([A-Z0-9]{6,15})/i,
      /([A-Z]{1,2}\d{6,9})/,
    ],
    excelAliases: ['passport_number', 'passport_no', 'passport', 'passportnum'],
  },
  {
    id: 'passport_issue_date',
    section: 'passport',
    label: 'Date of Issue',
    type: 'date',
    required: true,
    ocrPatterns: [
      /(?:date\s*of\s*issue|issue\s*date|issued)[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
      /1\.13[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    ],
    excelAliases: ['passport_issue_date', 'issue_date', 'date_of_issue'],
  },
  {
    id: 'passport_issue_place',
    section: 'passport',
    label: 'Place of Issue',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:place\s*of\s*issue|issued\s*(?:at|by|in))[:\s]*([A-Za-z\s]+)/i,
      /1\.14[:\s]*([A-Za-z\s]+)/i,
    ],
    excelAliases: ['passport_issue_place', 'issue_place', 'place_of_issue'],
  },
  {
    id: 'passport_expiry_date',
    section: 'passport',
    label: 'Date of Expiry',
    type: 'date',
    required: true,
    ocrPatterns: [
      /(?:date\s*of\s*expiry|expiry\s*date|expires?|expiration)[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
      /1\.15[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    ],
    excelAliases: ['passport_expiry', 'expiry_date', 'date_of_expiry', 'expiration'],
  },

  // ==================== OCCUPATION INFORMATION ====================
  {
    id: 'occupation',
    section: 'occupation',
    label: 'Current Occupation',
    type: 'select',
    required: true,
    options: [
      'Business Person',
      'Company Employee',
      'Government Official',
      'Military Personnel',
      'Student',
      'Teacher/Professor',
      'Doctor/Healthcare',
      'Engineer',
      'Self-Employed',
      'Retired',
      'Unemployed',
      'Housewife/Househusband',
      'Child (Under 18)',
      'Religious Personnel',
      'Entertainer/Athlete',
      'Journalist/Media',
      'NGO Staff',
      'Other',
    ],
    ocrPatterns: [
      /(?:occupation|job|profession|employment)[:\s]*([A-Za-z\s]+)/i,
      /1\.16[:\s]*([A-Za-z\s]+)/i,
    ],
    excelAliases: ['occupation', 'job', 'profession', 'employment'],
  },
  {
    id: 'employer_name',
    section: 'occupation',
    label: 'Employer / School Name',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:employer|company|school|organization)[:\s]*([A-Za-z0-9\s]+)/i,
      /1\.17[:\s]*([A-Za-z0-9\s]+)/i,
    ],
    excelAliases: ['employer', 'company', 'school', 'organization', 'employer_name'],
  },
  {
    id: 'employer_phone',
    section: 'occupation',
    label: 'Employer Phone',
    type: 'tel',
    required: false,
    ocrPatterns: [
      /(?:employer\s*phone|company\s*phone|work\s*phone)[:\s]*([\d\s\-\+\(\)]+)/i,
    ],
    excelAliases: ['employer_phone', 'company_phone', 'work_phone'],
  },
  {
    id: 'employer_address',
    section: 'occupation',
    label: 'Employer Address',
    type: 'textarea',
    required: false,
    ocrPatterns: [
      /(?:employer\s*address|company\s*address|work\s*address)[:\s]*([^\n]+)/i,
    ],
    excelAliases: ['employer_address', 'company_address', 'work_address'],
  },

  // ==================== CONTACT INFORMATION ====================
  {
    id: 'residential_address',
    section: 'contact',
    label: 'Current Residential Address',
    type: 'textarea',
    required: true,
    ocrPatterns: [
      /(?:residential\s*address|home\s*address|address)[:\s]*([^\n]+)/i,
      /1\.18[:\s]*([^\n]+)/i,
    ],
    excelAliases: ['address', 'residential_address', 'home_address', 'street'],
  },
  {
    id: 'phone_number',
    section: 'contact',
    label: 'Phone Number',
    type: 'tel',
    required: true,
    ocrPatterns: [
      /(?:phone|tel|telephone|mobile|cell)[:\s]*([\d\s\-\+\(\)]{7,20})/i,
      /1\.20[:\s]*([\d\s\-\+\(\)]{7,20})/i,
    ],
    excelAliases: ['phone', 'phone_number', 'telephone', 'mobile', 'cell'],
  },
  {
    id: 'email',
    section: 'contact',
    label: 'Email Address',
    type: 'email',
    required: true,
    ocrPatterns: [
      /(?:e-?mail|email\s*address)[:\s]*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
      /1\.21[:\s]*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
    ],
    excelAliases: ['email', 'email_address', 'e_mail'],
  },

  // ==================== EMERGENCY CONTACT ====================
  {
    id: 'emergency_contact_name',
    section: 'emergency',
    label: 'Emergency Contact Name',
    type: 'text',
    required: true,
    ocrPatterns: [
      /(?:emergency\s*contact|contact\s*person)[:\s]*([A-Za-z\s]+)/i,
      /1\.22[:\s]*([A-Za-z\s]+)/i,
    ],
    excelAliases: ['emergency_contact', 'emergency_contact_name', 'contact_person'],
  },
  {
    id: 'emergency_contact_phone',
    section: 'emergency',
    label: 'Emergency Contact Phone',
    type: 'tel',
    required: true,
    ocrPatterns: [
      /(?:emergency\s*(?:phone|tel|number))[:\s]*([\d\s\-\+\(\)]{7,20})/i,
      /1\.23[:\s]*([\d\s\-\+\(\)]{7,20})/i,
    ],
    excelAliases: ['emergency_phone', 'emergency_contact_phone'],
  },
  {
    id: 'emergency_contact_relationship',
    section: 'emergency',
    label: 'Relationship with Emergency Contact',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:relationship|relation)[:\s]*([A-Za-z\s]+)/i,
      /1\.24[:\s]*([A-Za-z\s]+)/i,
    ],
    excelAliases: ['emergency_relationship', 'relationship'],
  },

  // ==================== VISA INFORMATION ====================
  {
    id: 'visa_type',
    section: 'visa',
    label: 'Type of Visa',
    type: 'select',
    required: true,
    options: [
      'L - Tourist',
      'M - Business/Trade',
      'F - Exchange/Visit',
      'Z - Work',
      'X1 - Long-term Study',
      'X2 - Short-term Study',
      'S1 - Long-term Family Visit',
      'S2 - Short-term Family Visit',
      'Q1 - Family Reunion',
      'Q2 - Short-term Family Visit',
      'R - Talent',
      'C - Crew',
      'J1 - Journalist (Long-term)',
      'J2 - Journalist (Short-term)',
      'G - Transit',
      'D - Permanent Residence',
    ],
    ocrPatterns: [
      /(?:visa\s*type|type\s*of\s*visa)[:\s]*([A-Z][0-9]?\s*-?\s*[A-Za-z\s]*)/i,
      /2\.1[:\s]*([A-Z][0-9]?\s*-?\s*[A-Za-z\s]*)/i,
    ],
    excelAliases: ['visa_type', 'visa_category', 'type_of_visa'],
  },
  {
    id: 'number_of_entries',
    section: 'visa',
    label: 'Number of Entries Requested',
    type: 'select',
    required: true,
    options: ['Single', 'Double', 'Multiple'],
    ocrPatterns: [
      /(?:number\s*of\s*entries|entries)[:\s]*(single|double|multiple|1|2)/i,
      /2\.2[:\s]*(single|double|multiple|1|2)/i,
    ],
    excelAliases: ['entries', 'number_of_entries', 'num_entries'],
  },
  {
    id: 'intended_entry_date',
    section: 'visa',
    label: 'Intended Date of First Entry',
    type: 'date',
    required: true,
    ocrPatterns: [
      /(?:intended\s*entry|first\s*entry|arrival\s*date|entry\s*date)[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
      /2\.3[:\s]*(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    ],
    excelAliases: ['entry_date', 'intended_entry_date', 'arrival_date', 'first_entry'],
  },
  {
    id: 'duration_of_stay',
    section: 'visa',
    label: 'Duration of Each Stay (Days)',
    type: 'number',
    required: true,
    validation: {
      minLength: 1,
      maxLength: 3,
    },
    ocrPatterns: [
      /(?:duration|stay|days)[:\s]*(\d{1,3})/i,
      /2\.4[:\s]*(\d{1,3})/i,
    ],
    excelAliases: ['duration', 'stay_days', 'duration_of_stay', 'days'],
  },

  // ==================== TRAVEL INFORMATION ====================
  {
    id: 'purpose_of_visit',
    section: 'travel',
    label: 'Purpose of Visit to China',
    type: 'textarea',
    required: true,
    ocrPatterns: [
      /(?:purpose|purpose\s*of\s*visit|reason)[:\s]*([^\n]+)/i,
      /2\.5[:\s]*([^\n]+)/i,
    ],
    excelAliases: ['purpose', 'purpose_of_visit', 'visit_purpose', 'reason'],
  },
  {
    id: 'places_to_visit',
    section: 'travel',
    label: 'Places to Visit in China',
    type: 'textarea',
    required: true,
    ocrPatterns: [
      /(?:places?\s*to\s*visit|destinations?|cities?)[:\s]*([^\n]+)/i,
      /2\.6[:\s]*([^\n]+)/i,
    ],
    excelAliases: ['places', 'places_to_visit', 'cities', 'destinations'],
  },
  {
    id: 'hotel_name',
    section: 'travel',
    label: 'Hotel / Accommodation Name',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:hotel|accommodation|lodging)[:\s]*([A-Za-z0-9\s]+)/i,
      /2\.7[:\s]*([A-Za-z0-9\s]+)/i,
    ],
    excelAliases: ['hotel', 'hotel_name', 'accommodation'],
  },
  {
    id: 'hotel_address',
    section: 'travel',
    label: 'Hotel Address in China',
    type: 'textarea',
    required: false,
    ocrPatterns: [
      /(?:hotel\s*address|accommodation\s*address)[:\s]*([^\n]+)/i,
    ],
    excelAliases: ['hotel_address', 'accommodation_address'],
  },

  // ==================== INVITING PARTY (if applicable) ====================
  {
    id: 'inviter_name',
    section: 'inviter',
    label: 'Inviting Person / Organization Name',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:inviter|inviting\s*(?:person|organization|party|company))[:\s]*([A-Za-z0-9\s]+)/i,
      /3\.1[:\s]*([A-Za-z0-9\s]+)/i,
    ],
    excelAliases: ['inviter', 'inviter_name', 'inviting_party', 'host'],
  },
  {
    id: 'inviter_phone',
    section: 'inviter',
    label: 'Inviter Phone',
    type: 'tel',
    required: false,
    ocrPatterns: [
      /(?:inviter\s*phone|host\s*phone)[:\s]*([\d\s\-\+\(\)]{7,20})/i,
    ],
    excelAliases: ['inviter_phone', 'host_phone'],
  },
  {
    id: 'inviter_address',
    section: 'inviter',
    label: 'Inviter Address',
    type: 'textarea',
    required: false,
    ocrPatterns: [
      /(?:inviter\s*address|host\s*address)[:\s]*([^\n]+)/i,
    ],
    excelAliases: ['inviter_address', 'host_address'],
  },
  {
    id: 'inviter_relationship',
    section: 'inviter',
    label: 'Relationship with Inviter',
    type: 'text',
    required: false,
    ocrPatterns: [
      /(?:relationship\s*with\s*inviter|relation)[:\s]*([A-Za-z\s]+)/i,
    ],
    excelAliases: ['inviter_relationship', 'relationship_inviter'],
  },

  // ==================== PREVIOUS CHINA TRAVEL ====================
  {
    id: 'previous_china_visa',
    section: 'history',
    label: 'Have you been to China before?',
    type: 'select',
    required: true,
    options: ['Yes', 'No'],
    ocrPatterns: [
      /(?:been\s*to\s*china|visited\s*china|previous\s*china)[:\s]*(yes|no)/i,
      /4\.1[:\s]*(yes|no)/i,
    ],
    excelAliases: ['been_to_china', 'previous_visit', 'visited_china'],
  },
  {
    id: 'previous_china_visit_date',
    section: 'history',
    label: 'Last Visit Date (if yes)',
    type: 'date',
    required: false,
    excelAliases: ['last_visit_date', 'previous_visit_date'],
  },
  {
    id: 'previous_visa_number',
    section: 'history',
    label: 'Previous China Visa Number',
    type: 'text',
    required: false,
    excelAliases: ['previous_visa_number', 'last_visa_number'],
  },

  // ==================== OTHER INFORMATION ====================
  {
    id: 'countries_visited_30days',
    section: 'other',
    label: 'Countries visited in last 30 days',
    type: 'textarea',
    required: false,
    ocrPatterns: [
      /(?:countries?\s*visited|travel\s*history)[:\s]*([^\n]*)/i,
      /5\.1[:\s]*([^\n]*)/i,
    ],
    excelAliases: ['countries_visited', 'recent_travel'],
  },
  {
    id: 'criminal_record',
    section: 'other',
    label: 'Any criminal record?',
    type: 'select',
    required: true,
    options: ['Yes', 'No'],
    ocrPatterns: [
      /(?:criminal\s*record|crime)[:\s]*(yes|no)/i,
      /5\.2[:\s]*(yes|no)/i,
    ],
    excelAliases: ['criminal_record', 'has_criminal_record'],
  },
  {
    id: 'health_conditions',
    section: 'other',
    label: 'Health Conditions',
    type: 'textarea',
    required: false,
    ocrPatterns: [
      /(?:health|medical|conditions?)[:\s]*([^\n]*)/i,
      /5\.3[:\s]*([^\n]*)/i,
    ],
    excelAliases: ['health', 'health_conditions', 'medical'],
  },

  // ==================== PHOTOGRAPH ====================
  {
    id: 'photo_url',
    section: 'photo',
    label: 'Passport Photo',
    type: 'text',
    required: false,
    excelAliases: ['photo', 'photo_url', 'photograph'],
  },
];

// Get fields by section
export function getFieldsBySection(section: string): ChinaVisaField[] {
  return CHINA_VISA_FIELDS.filter(f => f.section === section);
}

// Get all unique sections
export function getAllSections(): string[] {
  return [...new Set(CHINA_VISA_FIELDS.map(f => f.section))];
}

// Find field by Excel column name
export function findFieldByExcelColumn(columnName: string): ChinaVisaField | undefined {
  const normalized = columnName.toLowerCase().replace(/[\s\-_]+/g, '_').trim();
  return CHINA_VISA_FIELDS.find(f => 
    f.excelAliases?.some(alias => 
      alias.toLowerCase().replace(/[\s\-_]+/g, '_') === normalized
    ) || f.id === normalized
  );
}

// Find field by OCR text
export function findFieldByOCRText(text: string): { field: ChinaVisaField; value: string } | null {
  for (const field of CHINA_VISA_FIELDS) {
    if (field.ocrPatterns) {
      for (const pattern of field.ocrPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return { field, value: match[1].trim() };
        }
      }
    }
  }
  return null;
}
