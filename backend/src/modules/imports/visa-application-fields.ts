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

export const VISA_APPLICATION_FIELDS: VisaField[] = [
  // ==================== DOCUMENTS ====================
  {
    id: 'visaPhoto',
    name: 'visaPhotoId',
    label: 'Upload Visa Photo',
    section: 'documents',
    type: 'file',
    required: true,
    excelColumns: ['Visa Photo', 'Photo', 'Photo ID'],
    pdfFieldNames: ['visa_photo', 'applicant_photo', 'photo_id'],
    format: 'jpg, png, pdf',
    maxLength: 10485760,
  },
  {
    id: 'passportPage1',
    name: 'passportPage1Id',
    label: 'Passport Blank Page 01',
    section: 'documents',
    type: 'file',
    required: true,
    excelColumns: ['Passport Page 1', 'Passport Blank Page 1', 'Passport P1'],
    pdfFieldNames: ['passport_page_1', 'passport_blank_1'],
  },
  {
    id: 'passportPage2',
    name: 'passportPage2Id',
    label: 'Passport Blank Page 02',
    section: 'documents',
    type: 'file',
    required: true,
    excelColumns: ['Passport Page 2', 'Passport Blank Page 2', 'Passport P2'],
    pdfFieldNames: ['passport_page_2', 'passport_blank_2'],
  },
  {
    id: 'passportBackPage',
    name: 'passportBackPageId',
    label: 'Passport Back Page (Information Page)',
    section: 'documents',
    type: 'file',
    required: true,
    excelColumns: ['Passport Back', 'Passport Info Page', 'Passport Information'],
    pdfFieldNames: ['passport_back', 'passport_information_page'],
  },

  // ==================== PERSONAL INFORMATION ====================
  {
    id: 'fullName',
    name: 'fullName',
    label: "Applicant's Full Name",
    section: 'personalInfo',
    type: 'text',
    required: true,
    excelColumns: ['Full Name', 'Name', 'Applicant Name', 'First and Last Name'],
    pdfFieldNames: ['full_name', 'applicant_name', 'name'],
    examples: ['John Michael Smith', 'Maria Garcia Rodriguez'],
  },
  {
    id: 'placeOfBirthCountry',
    name: 'placeOfBirthCountry',
    label: 'Place of Birth - COUNTRY',
    section: 'personalInfo',
    type: 'text',
    required: true,
    excelColumns: ['Birth Country', 'Country of Birth', 'POB Country'],
    pdfFieldNames: ['place_of_birth_country', 'birth_country'],
  },
  {
    id: 'placeOfBirthProvince',
    name: 'placeOfBirthProvince',
    label: 'Place of Birth - PROVINCE/STATE',
    section: 'personalInfo',
    type: 'text',
    required: false,
    excelColumns: ['Birth Province', 'Birth State', 'POB Province', 'State/Province'],
    pdfFieldNames: ['place_of_birth_province', 'birth_state'],
  },
  {
    id: 'placeOfBirthCity',
    name: 'placeOfBirthCity',
    label: 'Place of Birth - CITY',
    section: 'personalInfo',
    type: 'text',
    required: false,
    excelColumns: ['Birth City', 'City of Birth', 'POB City'],
    pdfFieldNames: ['place_of_birth_city', 'birth_city'],
  },
  {
    id: 'maritalStatus',
    name: 'maritalStatus',
    label: 'Marital Status',
    section: 'personalInfo',
    type: 'select',
    required: true,
    excelColumns: ['Marital Status', 'Status', 'Marital'],
    pdfFieldNames: ['marital_status'],
    options: ['Single', 'Married', 'Divorced', 'Widowed', 'Other'],
  },
  {
    id: 'maritalStatusOther',
    name: 'maritalStatusOther',
    label: 'Marital Status - Other (if applicable)',
    section: 'personalInfo',
    type: 'text',
    required: false,
    excelColumns: ['Marital Status Other', 'Other Marital Status'],
    pdfFieldNames: ['marital_status_other'],
  },

  // ==================== NATIONALITY ====================
  {
    id: 'hasOtherNationality',
    name: 'hasOtherNationality',
    label: 'Do you have any other nationality?',
    section: 'nationality',
    type: 'select',
    required: true,
    excelColumns: ['Other Nationality', 'Has Other Nationality'],
    pdfFieldNames: ['other_nationality', 'has_other_nationality'],
    options: ['Yes', 'No'],
  },
  {
    id: 'otherNationality',
    name: 'otherNationality',
    label: 'Other Nationality - Country',
    section: 'nationality',
    type: 'text',
    required: false,
    excelColumns: ['Other Nationality Country', 'Second Nationality'],
    pdfFieldNames: ['other_nationality_country'],
  },
  {
    id: 'otherNationalityIdNumber',
    name: 'otherNationalityIdNumber',
    label: 'Other Nationality - ID Number',
    section: 'nationality',
    type: 'text',
    required: false,
    excelColumns: ['Other ID Number', 'Second ID Number'],
    pdfFieldNames: ['other_nationality_id'],
  },
  {
    id: 'otherNationalityPassportNumber',
    name: 'otherNationalityPassportNumber',
    label: 'Other Nationality - Passport Number',
    section: 'nationality',
    type: 'text',
    required: false,
    excelColumns: ['Other Passport Number', 'Second Passport Number'],
    pdfFieldNames: ['other_nationality_passport'],
  },
  {
    id: 'hasPermanentResidence',
    name: 'hasPermanentResidence',
    label: 'Do you have permanent residence of any other country or region?',
    section: 'nationality',
    type: 'select',
    required: true,
    excelColumns: ['Permanent Residence', 'Other Residence'],
    pdfFieldNames: ['permanent_residence', 'has_permanent_residence'],
    options: ['Yes', 'No'],
  },
  {
    id: 'permanentResidenceCountries',
    name: 'permanentResidenceCountries',
    label: 'Permanent Residence Countries',
    section: 'nationality',
    type: 'textarea',
    required: false,
    excelColumns: ['Residence Countries', 'PR Countries'],
    pdfFieldNames: ['permanent_residence_countries'],
  },
  {
    id: 'hasFormerNationality',
    name: 'hasFormerNationality',
    label: 'Have you ever held any other nationality?',
    section: 'nationality',
    type: 'select',
    required: true,
    excelColumns: ['Former Nationality', 'Previous Nationality'],
    pdfFieldNames: ['former_nationality', 'has_former_nationality'],
    options: ['Yes', 'No'],
  },
  {
    id: 'formerNationality',
    name: 'formerNationality',
    label: 'Former Nationality',
    section: 'nationality',
    type: 'text',
    required: false,
    excelColumns: ['Former Nationality Country'],
    pdfFieldNames: ['former_nationality_country'],
  },

  // ==================== OCCUPATION & WORK EXPERIENCE ====================
  {
    id: 'currentOccupation',
    name: 'currentOccupation',
    label: 'Current Occupation',
    section: 'occupation',
    type: 'text',
    required: true,
    excelColumns: ['Occupation', 'Current Job', 'Job Title'],
    pdfFieldNames: ['current_occupation', 'occupation'],
    examples: ['Software Engineer', 'Manager', 'Student', 'Retired'],
  },
  {
    id: 'workExperienceStartDate',
    name: 'workExperienceStartDate',
    label: 'Work Experience: Start Date',
    section: 'occupation',
    type: 'date',
    required: false,
    excelColumns: ['Work Start Date', 'Employment Start'],
    pdfFieldNames: ['work_start_date'],
    format: 'YYYY-MM-DD',
  },
  {
    id: 'workExperienceEndDate',
    name: 'workExperienceEndDate',
    label: 'Work Experience: End Date',
    section: 'occupation',
    type: 'date',
    required: false,
    excelColumns: ['Work End Date', 'Employment End'],
    pdfFieldNames: ['work_end_date'],
    format: 'YYYY-MM-DD',
  },
  {
    id: 'companyName',
    name: 'companyName',
    label: 'Name of Company',
    section: 'occupation',
    type: 'text',
    required: false,
    excelColumns: ['Company Name', 'Employer', 'Organization'],
    pdfFieldNames: ['company_name', 'employer_name'],
  },
  {
    id: 'companyAddress',
    name: 'companyAddress',
    label: 'Address of Company',
    section: 'occupation',
    type: 'textarea',
    required: false,
    excelColumns: ['Company Address', 'Employer Address'],
    pdfFieldNames: ['company_address'],
  },
  {
    id: 'companyPhone',
    name: 'companyPhone',
    label: 'Telephone number of Company',
    section: 'occupation',
    type: 'phone',
    required: false,
    excelColumns: ['Company Phone', 'Company Telephone'],
    pdfFieldNames: ['company_phone'],
  },
  {
    id: 'supervisorName',
    name: 'supervisorName',
    label: "Supervisor's Name",
    section: 'occupation',
    type: 'text',
    required: false,
    excelColumns: ['Supervisor', 'Manager Name'],
    pdfFieldNames: ['supervisor_name', 'manager_name'],
  },
  {
    id: 'supervisorPhone',
    name: 'supervisorPhone',
    label: "Supervisor's telephone Number",
    section: 'occupation',
    type: 'phone',
    required: false,
    excelColumns: ['Supervisor Phone', 'Manager Phone'],
    pdfFieldNames: ['supervisor_phone'],
  },
  {
    id: 'position',
    name: 'position',
    label: 'Position',
    section: 'occupation',
    type: 'text',
    required: false,
    excelColumns: ['Position', 'Job Position', 'Title'],
    pdfFieldNames: ['position'],
  },
  {
    id: 'duty',
    name: 'duty',
    label: 'Duty',
    section: 'occupation',
    type: 'textarea',
    required: false,
    excelColumns: ['Duty', 'Responsibilities', 'Job Description'],
    pdfFieldNames: ['duty', 'job_description'],
  },

  // ==================== EDUCATION ====================
  {
    id: 'schoolName',
    name: 'schoolName',
    label: 'Name of School/College/University',
    section: 'education',
    type: 'text',
    required: false,
    excelColumns: ['School', 'University', 'College'],
    pdfFieldNames: ['school_name', 'university_name'],
  },
  {
    id: 'educationLevel',
    name: 'educationLevel',
    label: 'Highest Level of Education',
    section: 'education',
    type: 'text',
    required: false,
    excelColumns: ['Education Level', 'Degree', 'Qualification'],
    pdfFieldNames: ['education_level', 'qualification'],
    examples: ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma'],
  },
  {
    id: 'majorSubject',
    name: 'majorSubject',
    label: 'Major Subject',
    section: 'education',
    type: 'text',
    required: false,
    excelColumns: ['Major', 'Subject', 'Field of Study'],
    pdfFieldNames: ['major_subject', 'field_of_study'],
    examples: ['Computer Science', 'Business Administration', 'Medicine'],
  },

  // ==================== CURRENT RESIDENCE ====================
  {
    id: 'residenceCountry',
    name: 'residenceCountry',
    label: 'Current Residence Address: Country / Region',
    section: 'residence',
    type: 'text',
    required: true,
    excelColumns: ['Residence Country', 'Current Country'],
    pdfFieldNames: ['residence_country', 'current_country'],
  },
  {
    id: 'residenceProvince',
    name: 'residenceProvince',
    label: 'Current Residence: Province / State',
    section: 'residence',
    type: 'text',
    required: false,
    excelColumns: ['Residence Province', 'State'],
    pdfFieldNames: ['residence_province', 'residence_state'],
  },
  {
    id: 'residenceCity',
    name: 'residenceCity',
    label: 'Current Residence: City',
    section: 'residence',
    type: 'text',
    required: false,
    excelColumns: ['Residence City', 'Current City'],
    pdfFieldNames: ['residence_city'],
  },
  {
    id: 'residenceStreet',
    name: 'residenceStreet',
    label: 'Current Residence: No. / Street / Avenue',
    section: 'residence',
    type: 'textarea',
    required: false,
    excelColumns: ['Residence Address', 'Street Address', 'Address'],
    pdfFieldNames: ['residence_street', 'street_address'],
  },
  {
    id: 'residenceMobilePhone',
    name: 'residenceMobilePhone',
    label: 'Current Residence: Mobile phone number',
    section: 'residence',
    type: 'phone',
    required: true,
    excelColumns: ['Mobile Phone', 'Mobile', 'Cell Phone'],
    pdfFieldNames: ['mobile_phone', 'cell_phone'],
  },
  {
    id: 'residencePhone',
    name: 'residencePhone',
    label: 'Current Residence: Phone number',
    section: 'residence',
    type: 'phone',
    required: false,
    excelColumns: ['Phone', 'Telephone', 'Landline'],
    pdfFieldNames: ['phone', 'telephone'],
  },
  {
    id: 'residenceEmail',
    name: 'residenceEmail',
    label: 'Current Residence: Email',
    section: 'residence',
    type: 'email',
    required: true,
    excelColumns: ['Email', 'Email Address'],
    pdfFieldNames: ['email', 'email_address'],
  },

  // ==================== FAMILY INFORMATION ====================
  {
    id: 'spouseFirstName',
    name: 'spouseFirstName',
    label: 'Spouse First Name',
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Spouse First Name'],
    pdfFieldNames: ['spouse_first_name'],
  },
  {
    id: 'spouseLastName',
    name: 'spouseLastName',
    label: 'Spouse Last Name',
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Spouse Last Name'],
    pdfFieldNames: ['spouse_last_name'],
  },
  {
    id: 'spouseDateOfBirth',
    name: 'spouseDateOfBirth',
    label: 'Spouse Date of Birth',
    section: 'family',
    type: 'date',
    required: false,
    excelColumns: ['Spouse DOB', 'Spouse Date of Birth'],
    pdfFieldNames: ['spouse_dob'],
    format: 'YYYY-MM-DD',
  },
  {
    id: 'spouseCountryOfBirth',
    name: 'spouseCountryOfBirth',
    label: 'Spouse Country and City of Birth',
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Spouse Country City Birth'],
    pdfFieldNames: ['spouse_birth_place'],
  },
  {
    id: 'spouseAddress',
    name: 'spouseAddress',
    label: 'Spouse Address',
    section: 'family',
    type: 'textarea',
    required: false,
    excelColumns: ['Spouse Address'],
    pdfFieldNames: ['spouse_address'],
  },
  {
    id: 'spouseOccupation',
    name: 'spouseOccupation',
    label: 'Spouse Occupation',
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Spouse Occupation', 'Spouse Job'],
    pdfFieldNames: ['spouse_occupation'],
  },

  // Father
  {
    id: 'fatherFirstName',
    name: 'fatherFirstName',
    label: "Father's First Name",
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Father First Name'],
    pdfFieldNames: ['father_first_name'],
  },
  {
    id: 'fatherLastName',
    name: 'fatherLastName',
    label: "Father's Last Name",
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Father Last Name'],
    pdfFieldNames: ['father_last_name'],
  },
  {
    id: 'fatherNationality',
    name: 'fatherNationality',
    label: "Father's Nationality",
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Father Nationality'],
    pdfFieldNames: ['father_nationality'],
  },
  {
    id: 'fatherDateOfBirth',
    name: 'fatherDateOfBirth',
    label: "Father's Date of Birth",
    section: 'family',
    type: 'date',
    required: false,
    excelColumns: ['Father DOB'],
    pdfFieldNames: ['father_dob'],
    format: 'YYYY-MM-DD',
  },

  // Mother
  {
    id: 'motherFirstName',
    name: 'motherFirstName',
    label: "Mother's First Name",
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Mother First Name'],
    pdfFieldNames: ['mother_first_name'],
  },
  {
    id: 'motherLastName',
    name: 'motherLastName',
    label: "Mother's Last Name",
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Mother Last Name'],
    pdfFieldNames: ['mother_last_name'],
  },
  {
    id: 'motherNationality',
    name: 'motherNationality',
    label: "Mother's Nationality",
    section: 'family',
    type: 'text',
    required: false,
    excelColumns: ['Mother Nationality'],
    pdfFieldNames: ['mother_nationality'],
  },
  {
    id: 'motherDateOfBirth',
    name: 'motherDateOfBirth',
    label: "Mother's Date of Birth",
    section: 'family',
    type: 'date',
    required: false,
    excelColumns: ['Mother DOB'],
    pdfFieldNames: ['mother_dob'],
    format: 'YYYY-MM-DD',
  },

  // Children
  {
    id: 'children',
    name: 'children',
    label: 'Children Information',
    section: 'family',
    type: 'json',
    required: false,
    excelColumns: ['Children', 'Child Information'],
    pdfFieldNames: ['children'],
  },

  // Emergency Contact
  {
    id: 'emergencyFirstName',
    name: 'emergencyFirstName',
    label: 'Emergency Contact: First Name',
    section: 'emergency',
    type: 'text',
    required: true,
    excelColumns: ['Emergency First Name'],
    pdfFieldNames: ['emergency_first_name'],
  },
  {
    id: 'emergencyLastName',
    name: 'emergencyLastName',
    label: 'Emergency Contact: Last Name',
    section: 'emergency',
    type: 'text',
    required: true,
    excelColumns: ['Emergency Last Name'],
    pdfFieldNames: ['emergency_last_name'],
  },
  {
    id: 'emergencyRelationship',
    name: 'emergencyRelationship',
    label: 'Emergency Contact: Relationship to you',
    section: 'emergency',
    type: 'text',
    required: true,
    excelColumns: ['Emergency Relationship'],
    pdfFieldNames: ['emergency_relationship'],
    examples: ['Spouse', 'Parent', 'Sibling', 'Friend'],
  },
  {
    id: 'emergencyPhone',
    name: 'emergencyPhone',
    label: 'Emergency Contact: Phone Number',
    section: 'emergency',
    type: 'phone',
    required: true,
    excelColumns: ['Emergency Phone'],
    pdfFieldNames: ['emergency_phone'],
  },

  // ==================== TRAVEL HISTORY ====================
  {
    id: 'hasBeenToChina',
    name: 'hasBeenToChina',
    label: 'Have you ever been to China?',
    section: 'travelHistory',
    type: 'select',
    required: true,
    excelColumns: ['Been to China', 'China Visit'],
    pdfFieldNames: ['been_to_china'],
    options: ['Yes', 'No'],
  },
  {
    id: 'previousChineseVisa',
    name: 'previousChineseVisaIds',
    label: 'Previous Chinese Visa',
    section: 'travelHistory',
    type: 'file',
    required: false,
    excelColumns: ['Previous Visa', 'Old Visa'],
    pdfFieldNames: ['previous_chinese_visa'],
  },
  {
    id: 'hasValidVisas',
    name: 'hasValidVisas',
    label: 'Do you currently hold any valid visas issued by other countries?',
    section: 'travelHistory',
    type: 'select',
    required: true,
    excelColumns: ['Valid Visas', 'Other Visas'],
    pdfFieldNames: ['valid_visas'],
    options: ['Yes', 'No'],
  },
  {
    id: 'validVisaCountries',
    name: 'validVisaCountries',
    label: 'Valid Visa Countries',
    section: 'travelHistory',
    type: 'textarea',
    required: false,
    excelColumns: ['Visa Countries', 'Countries with Valid Visas'],
    pdfFieldNames: ['valid_visa_countries'],
  },
  {
    id: 'countriesVisitedLast12Months',
    name: 'countriesVisitedLast12Months',
    label: 'Countries visited in the past 12 months',
    section: 'travelHistory',
    type: 'textarea',
    required: false,
    excelColumns: ['Countries Visited', 'Travel History'],
    pdfFieldNames: ['countries_visited_12_months'],
  },
];

export function findFieldByExcelColumn(headerText: string): VisaField | null {
  const normalized = headerText.toLowerCase().trim();

  for (const field of VISA_APPLICATION_FIELDS) {
    for (const column of field.excelColumns) {
      if (column.toLowerCase() === normalized) {
        return field;
      }
    }
    for (const column of field.excelColumns) {
      if (
        column.toLowerCase().includes(normalized) ||
        normalized.includes(column.toLowerCase())
      ) {
        return field;
      }
    }
  }

  return null;
}

export function findFieldByPDFField(pdfFieldName: string): VisaField | null {
  const normalized = pdfFieldName.toLowerCase().trim();

  for (const field of VISA_APPLICATION_FIELDS) {
    for (const pdfName of field.pdfFieldNames) {
      if (pdfName.toLowerCase() === normalized) {
        return field;
      }
    }
  }

  return null;
}

export function getFieldsBySection(section: string): VisaField[] {
  return VISA_APPLICATION_FIELDS.filter((f) => f.section === section);
}

export function getRequiredFields(): VisaField[] {
  return VISA_APPLICATION_FIELDS.filter((f) => f.required);
}

export function getAllSections(): string[] {
  const sections = new Set<string>();
  VISA_APPLICATION_FIELDS.forEach((f) => sections.add(f.section));
  return Array.from(sections);
}

export function formatFieldValue(field: VisaField, value: any): any {
  if (!value) return null;

  switch (field.type) {
    case 'date':
      return new Date(value);
    case 'phone':
      return String(value).replace(/[^\d+\-\s()]/g, '');
    case 'email':
      return String(value).toLowerCase().trim();
    case 'number':
      return parseInt(value);
    case 'json':
      return typeof value === 'string' ? JSON.parse(value) : value;
    default:
      return String(value).trim();
  }
}
