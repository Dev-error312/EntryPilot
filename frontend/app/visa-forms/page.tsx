/**
 * File: frontend/app/visa-forms/page.tsx
 * Complete Visa Application Form
 * All 80+ fields from Google Form
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

interface FormData {
  // Documents
  visaPhoto?: File;
  passportPage1?: File[];
  passportPage2?: File[];
  passportBackPage?: File[];

  // Personal Information
  fullName: string;
  placeOfBirthCountry: string;
  placeOfBirthProvince?: string;
  placeOfBirthCity?: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
  maritalStatusOther?: string;

  // Nationality
  hasOtherNationality: boolean;
  otherNationality?: string;
  otherNationalityIdNumber?: string;
  otherNationalityPassportNumber?: string;
  otherNationalityNotProvidedReason?: string;

  hasPermanentResidence: boolean;
  permanentResidenceCountries?: string;

  hasFormerNationality: boolean;
  formerNationality?: string;

  // Occupation & Work
  currentOccupation: string;
  workExperienceStartDate?: string;
  workExperienceEndDate?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  supervisorName?: string;
  supervisorPhone?: string;
  position?: string;
  duty?: string;

  // Education
  schoolName?: string;
  educationLevel?: string;
  majorSubject?: string;

  // Current Residence
  residenceCountry: string;
  residenceProvince?: string;
  residenceCity?: string;
  residenceStreet?: string;
  residenceMobilePhone: string;
  residencePhone?: string;
  residenceEmail: string;

  // Family - Spouse
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseDateOfBirth?: string;
  spouseCountryOfBirth?: string;
  spouseAddress?: string;
  spouseOccupation?: string;

  // Family - Father
  fatherFirstName?: string;
  fatherLastName?: string;
  fatherNationality?: string;
  fatherDateOfBirth?: string;

  // Family - Mother
  motherFirstName?: string;
  motherLastName?: string;
  motherNationality?: string;
  motherDateOfBirth?: string;

  // Family - Children (stored as JSON string)
  children?: string;

  // Emergency Contact
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyRelationship: string;
  emergencyPhone: string;

  // Travel History
  hasBeenToChina: boolean;
  previousChineseVisaFiles?: File[];
  hasValidVisas: boolean;
  validVisaCountries?: string;
  countriesVisitedLast12Months?: string;

  // Group
  groupId: string;
}

const SECTIONS = [
  'documents',
  'personalInfo',
  'nationality',
  'occupation',
  'education',
  'residence',
  'family',
  'emergency',
  'travelHistory'
];

export default function VisaApplicationForm() {
  const router = useRouter();
  const { user, organization } = useStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    placeOfBirthCountry: '',
    maritalStatus: 'Single',
    currentOccupation: '',
    residenceCountry: '',
    residenceMobilePhone: '',
    residenceEmail: '',
    emergencyFirstName: '',
    emergencyLastName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    hasOtherNationality: false,
    hasPermanentResidence: false,
    hasFormerNationality: false,
    hasBeenToChina: false,
    hasValidVisas: false,
    groupId: '',
    children: '[]'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRefs = {
    visaPhoto: useRef<HTMLInputElement>(null),
    passportPage1: useRef<HTMLInputElement>(null),
    passportPage2: useRef<HTMLInputElement>(null),
    passportBackPage: useRef<HTMLInputElement>(null),
    previousChineseVisa: useRef<HTMLInputElement>(null)
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: keyof FormData, files: FileList | null) => {
    if (!files) return;

    if (field === 'visaPhoto') {
      setFormData(prev => ({
        ...prev,
        visaPhoto: files[0]
      }));
    } else if (field === 'passportPage1') {
      setFormData(prev => ({
        ...prev,
        passportPage1: Array.from(files)
      }));
    } else if (field === 'passportPage2') {
      setFormData(prev => ({
        ...prev,
        passportPage2: Array.from(files)
      }));
    } else if (field === 'passportBackPage') {
      setFormData(prev => ({
        ...prev,
        passportBackPage: Array.from(files)
      }));
    } else if (field === 'previousChineseVisaFiles') {
      setFormData(prev => ({
        ...prev,
        previousChineseVisaFiles: Array.from(files)
      }));
    }
  };

  const handleAddChild = () => {
    const children = JSON.parse(formData.children || '[]');
    children.push({
      firstName: '',
      lastName: '',
      nationality: '',
      occupation: '',
      dateOfBirth: ''
    });
    setFormData(prev => ({
      ...prev,
      children: JSON.stringify(children)
    }));
  };

  const handleUpdateChild = (index: number, field: string, value: string) => {
    const children = JSON.parse(formData.children || '[]');
    children[index][field] = value;
    setFormData(prev => ({
      ...prev,
      children: JSON.stringify(children)
    }));
  };

  const handleRemoveChild = (index: number) => {
    const children = JSON.parse(formData.children || '[]');
    children.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      children: JSON.stringify(children)
    }));
  };

  const submitForm = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Create FormData for multipart upload
      const uploadFormData = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && typeof value !== 'object') {
          uploadFormData.append(key, String(value));
        }
      });

      // Add files
      if (formData.visaPhoto) {
        uploadFormData.append('visaPhoto', formData.visaPhoto);
      }
      if (formData.passportPage1) {
        formData.passportPage1.forEach((file, i) => {
          uploadFormData.append(`passportPage1`, file);
        });
      }
      if (formData.passportPage2) {
        formData.passportPage2.forEach((file, i) => {
          uploadFormData.append(`passportPage2`, file);
        });
      }
      if (formData.passportBackPage) {
        formData.passportBackPage.forEach((file, i) => {
          uploadFormData.append(`passportBackPage`, file);
        });
      }
      if (formData.previousChineseVisaFiles) {
        formData.previousChineseVisaFiles.forEach((file) => {
          uploadFormData.append(`previousChineseVisaFiles`, file);
        });
      }

      const response = await fetch('/api/visa-forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      const result = await response.json();
      setSuccess(true);

      // Redirect to success page or forms list
      setTimeout(() => {
        router.push(`/visa-forms/${result.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isSectionValid = (): boolean => {
    switch (currentSection) {
      case 0: // Documents
        return !!formData.visaPhoto;
      case 1: // Personal Info
        return !!(formData.fullName && formData.placeOfBirthCountry && formData.maritalStatus);
      case 2: // Nationality
        return true; // All optional
      case 3: // Occupation
        return !!formData.currentOccupation;
      case 4: // Education
        return true; // Optional
      case 5: // Residence
        return !!(formData.residenceCountry && formData.residenceMobilePhone && formData.residenceEmail);
      case 6: // Family
        return true; // Optional
      case 7: // Emergency
        return !!(formData.emergencyFirstName && formData.emergencyLastName && formData.emergencyPhone);
      case 8: // Travel History
        return true; // Optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">China Visa Application</h1>
          <p className="text-gray-600">Complete all required fields marked with *</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentSection + 1) / SECTIONS.length) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Section {currentSection + 1} of {SECTIONS.length}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Form submitted successfully! Redirecting...</p>
          </div>
        )}

        {/* Form Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          {/* Section 1: Documents */}
          {currentSection === 0 && (
            <DocumentSection formData={formData} handleFileChange={handleFileChange} fileInputRefs={fileInputRefs} />
          )}

          {/* Section 2: Personal Info */}
          {currentSection === 1 && (
            <PersonalInfoSection formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Section 3: Nationality */}
          {currentSection === 2 && (
            <NationalitySection formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Section 4: Occupation */}
          {currentSection === 3 && (
            <OccupationSection formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Section 5: Education */}
          {currentSection === 4 && (
            <EducationSection formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Section 6: Residence */}
          {currentSection === 5 && (
            <ResidenceSection formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Section 7: Family */}
          {currentSection === 6 && (
            <FamilySection
              formData={formData}
              handleInputChange={handleInputChange}
              handleAddChild={handleAddChild}
              handleUpdateChild={handleUpdateChild}
              handleRemoveChild={handleRemoveChild}
            />
          )}

          {/* Section 8: Emergency Contact */}
          {currentSection === 7 && (
            <EmergencyContactSection formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Section 9: Travel History */}
          {currentSection === 8 && (
            <TravelHistorySection formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} fileInputRefs={fileInputRefs} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {currentSection === SECTIONS.length - 1 ? (
              <button
                onClick={submitForm}
                disabled={loading || !isSectionValid()}
                className="px-8 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentSection(Math.min(SECTIONS.length - 1, currentSection + 1))}
                disabled={!isSectionValid()}
                className="px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION COMPONENTS ====================

function DocumentSection({
  formData,
  handleFileChange,
  fileInputRefs
}: {
  formData: FormData;
  handleFileChange: (field: keyof FormData, files: FileList | null) => void;
  fileInputRefs: any;
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Documents</h2>

      {/* Visa Photo */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Upload Visa Photo <span className="text-red-600">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Size: 33mm × 48mm | White Background | No Glasses | No Forehead Covered | No Light Color Garment
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => fileInputRefs.visaPhoto.current?.click()}
        >
          <input
            ref={fileInputRefs.visaPhoto}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange('visaPhoto', e.target.files)}
            className="hidden"
          />
          <p className="text-gray-600">
            {formData.visaPhoto ? formData.visaPhoto.name : 'Click to upload photo (Max 10 MB)'}
          </p>
        </div>
      </div>

      {/* Passport Page 1 */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Passport Blank Page 01 <span className="text-red-600">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => fileInputRefs.passportPage1.current?.click()}
        >
          <input
            ref={fileInputRefs.passportPage1}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('passportPage1', e.target.files)}
            className="hidden"
          />
          <p className="text-gray-600">
            {formData.passportPage1?.length ? `${formData.passportPage1.length} file(s) uploaded` : 'Click to upload (Up to 5 files, Max 10 MB each)'}
          </p>
        </div>
      </div>

      {/* Passport Page 2 */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Passport Blank Page 02 <span className="text-red-600">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => fileInputRefs.passportPage2.current?.click()}
        >
          <input
            ref={fileInputRefs.passportPage2}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('passportPage2', e.target.files)}
            className="hidden"
          />
          <p className="text-gray-600">
            {formData.passportPage2?.length ? `${formData.passportPage2.length} file(s) uploaded` : 'Click to upload (Up to 5 files, Max 10 MB each)'}
          </p>
        </div>
      </div>

      {/* Passport Back Page */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Passport Back Page (Information Page) <span className="text-red-600">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => fileInputRefs.passportBackPage.current?.click()}
        >
          <input
            ref={fileInputRefs.passportBackPage}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('passportBackPage', e.target.files)}
            className="hidden"
          />
          <p className="text-gray-600">
            {formData.passportBackPage?.length ? `${formData.passportBackPage.length} file(s) uploaded` : 'Click to upload (Up to 5 files, Max 10 MB each)'}
          </p>
        </div>
      </div>
    </div>
  );
}

function PersonalInfoSection({
  formData,
  handleInputChange
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Applicant's Full Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter your full name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Place of Birth - Country <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.placeOfBirthCountry}
            onChange={(e) => handleInputChange('placeOfBirthCountry', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Country"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Province / State
          </label>
          <input
            type="text"
            value={formData.placeOfBirthProvince || ''}
            onChange={(e) => handleInputChange('placeOfBirthProvince', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Province"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.placeOfBirthCity || ''}
            onChange={(e) => handleInputChange('placeOfBirthCity', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="City"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Marital Status <span className="text-red-600">*</span>
        </label>
        <div className="space-y-3">
          {['Single', 'Married', 'Divorced', 'Widowed', 'Other'].map((status) => (
            <label key={status} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="maritalStatus"
                value={status}
                checked={formData.maritalStatus === status}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">{status}</span>
            </label>
          ))}
        </div>

        {formData.maritalStatus === 'Other' && (
          <input
            type="text"
            placeholder="Please specify"
            value={formData.maritalStatusOther || ''}
            onChange={(e) => handleInputChange('maritalStatusOther', e.target.value)}
            className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        )}
      </div>
    </div>
  );
}

function NationalitySection({
  formData,
  handleInputChange
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Nationality Information</h2>

      {/* Other Nationality */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Do you have any other nationality? <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasOtherNationality === true}
              onChange={() => handleInputChange('hasOtherNationality', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasOtherNationality === false}
              onChange={() => handleInputChange('hasOtherNationality', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>

        {formData.hasOtherNationality && (
          <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-gray-900 mb-2">Other Nationality</label>
              <input
                type="text"
                value={formData.otherNationality || ''}
                onChange={(e) => handleInputChange('otherNationality', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Country name"
              />
            </div>

            <div>
              <label className="block text-gray-900 mb-2">ID Number</label>
              <input
                type="text"
                value={formData.otherNationalityIdNumber || ''}
                onChange={(e) => handleInputChange('otherNationalityIdNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-900 mb-2">Passport Number</label>
              <input
                type="text"
                value={formData.otherNationalityPassportNumber || ''}
                onChange={(e) => handleInputChange('otherNationalityPassportNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-900 mb-2">
                If neither ID nor Passport is provided, please specify reason
              </label>
              <textarea
                value={formData.otherNationalityNotProvidedReason || ''}
                onChange={(e) => handleInputChange('otherNationalityNotProvidedReason', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Permanent Residence */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Do you have permanent residence of any other country or region? <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasPermanentResidence === true}
              onChange={() => handleInputChange('hasPermanentResidence', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasPermanentResidence === false}
              onChange={() => handleInputChange('hasPermanentResidence', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>

        {formData.hasPermanentResidence && (
          <textarea
            placeholder="Please mention other permanent resident countries/regions"
            value={formData.permanentResidenceCountries || ''}
            onChange={(e) => handleInputChange('permanentResidenceCountries', e.target.value)}
            className="w-full mt-4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows={3}
          />
        )}
      </div>

      {/* Former Nationality */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Have you ever held any other nationality? <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasFormerNationality === true}
              onChange={() => handleInputChange('hasFormerNationality', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasFormerNationality === false}
              onChange={() => handleInputChange('hasFormerNationality', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>

        {formData.hasFormerNationality && (
          <input
            type="text"
            placeholder="Former nationality"
            value={formData.formerNationality || ''}
            onChange={(e) => handleInputChange('formerNationality', e.target.value)}
            className="w-full mt-4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        )}
      </div>
    </div>
  );
}

function OccupationSection({
  formData,
  handleInputChange
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Occupation & Work Experience</h2>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Current Occupation <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.currentOccupation}
          onChange={(e) => handleInputChange('currentOccupation', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="e.g., Software Engineer, Manager, Student"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-900 mb-2">Work Experience Start Date</label>
          <input
            type="date"
            value={formData.workExperienceStartDate || ''}
            onChange={(e) => handleInputChange('workExperienceStartDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-900 mb-2">Work Experience End Date</label>
          <input
            type="date"
            value={formData.workExperienceEndDate || ''}
            onChange={(e) => handleInputChange('workExperienceEndDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-900 mb-2">Name of Company</label>
        <input
          type="text"
          value={formData.companyName || ''}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-gray-900 mb-2">Address of Company</label>
        <textarea
          value={formData.companyAddress || ''}
          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-900 mb-2">Company Phone</label>
          <input
            type="tel"
            value={formData.companyPhone || ''}
            onChange={(e) => handleInputChange('companyPhone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-900 mb-2">Supervisor's Name</label>
          <input
            type="text"
            value={formData.supervisorName || ''}
            onChange={(e) => handleInputChange('supervisorName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-900 mb-2">Supervisor's Phone</label>
        <input
          type="tel"
          value={formData.supervisorPhone || ''}
          onChange={(e) => handleInputChange('supervisorPhone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-900 mb-2">Position</label>
          <input
            type="text"
            value={formData.position || ''}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-900 mb-2">Duty</label>
        <textarea
          value={formData.duty || ''}
          onChange={(e) => handleInputChange('duty', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          rows={3}
          placeholder="Describe your responsibilities"
        />
      </div>
    </div>
  );
}

function EducationSection({
  formData,
  handleInputChange
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Education</h2>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          School / College / University
        </label>
        <input
          type="text"
          value={formData.schoolName || ''}
          onChange={(e) => handleInputChange('schoolName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Highest Level of Education
        </label>
        <input
          type="text"
          value={formData.educationLevel || ''}
          onChange={(e) => handleInputChange('educationLevel', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="e.g., High School, Bachelor, Master, PhD"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Major Subject
        </label>
        <input
          type="text"
          value={formData.majorSubject || ''}
          onChange={(e) => handleInputChange('majorSubject', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="e.g., Computer Science, Business"
        />
      </div>
    </div>
  );
}

function ResidenceSection({
  formData,
  handleInputChange
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Current Residence Address</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Country / Region <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.residenceCountry}
            onChange={(e) => handleInputChange('residenceCountry', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Province / State
          </label>
          <input
            type="text"
            value={formData.residenceProvince || ''}
            onChange={(e) => handleInputChange('residenceProvince', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.residenceCity || ''}
            onChange={(e) => handleInputChange('residenceCity', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Street Address
        </label>
        <textarea
          value={formData.residenceStreet || ''}
          onChange={(e) => handleInputChange('residenceStreet', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Mobile Phone <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            value={formData.residenceMobilePhone}
            onChange={(e) => handleInputChange('residenceMobilePhone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="+1-555-0000"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Landline Phone
          </label>
          <input
            type="tel"
            value={formData.residencePhone || ''}
            onChange={(e) => handleInputChange('residencePhone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          value={formData.residenceEmail}
          onChange={(e) => handleInputChange('residenceEmail', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="your.email@example.com"
        />
      </div>
    </div>
  );
}

function FamilySection({
  formData,
  handleInputChange,
  handleAddChild,
  handleUpdateChild,
  handleRemoveChild
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
  handleAddChild: () => void;
  handleUpdateChild: (index: number, field: string, value: string) => void;
  handleRemoveChild: (index: number) => void;
}) {
  const children = JSON.parse(formData.children || '[]');

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Family Information</h2>

      {/* Spouse */}
      <div className="p-6 bg-gray-50 rounded-lg space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Spouse Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.spouseFirstName || ''}
            onChange={(e) => handleInputChange('spouseFirstName', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.spouseLastName || ''}
            onChange={(e) => handleInputChange('spouseLastName', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <input
          type="date"
          placeholder="Date of Birth"
          value={formData.spouseDateOfBirth || ''}
          onChange={(e) => handleInputChange('spouseDateOfBirth', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        <input
          type="text"
          placeholder="Country and City of Birth"
          value={formData.spouseCountryOfBirth || ''}
          onChange={(e) => handleInputChange('spouseCountryOfBirth', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        <textarea
          placeholder="Address"
          value={formData.spouseAddress || ''}
          onChange={(e) => handleInputChange('spouseAddress', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          rows={2}
        />

        <input
          type="text"
          placeholder="Occupation"
          value={formData.spouseOccupation || ''}
          onChange={(e) => handleInputChange('spouseOccupation', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Father */}
      <div className="p-6 bg-gray-50 rounded-lg space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Father's Information</h3>
        <p className="text-sm text-gray-600">(Only necessary if still living)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.fatherFirstName || ''}
            onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.fatherLastName || ''}
            onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nationality"
            value={formData.fatherNationality || ''}
            onChange={(e) => handleInputChange('fatherNationality', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={formData.fatherDateOfBirth || ''}
            onChange={(e) => handleInputChange('fatherDateOfBirth', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Mother */}
      <div className="p-6 bg-gray-50 rounded-lg space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Mother's Information</h3>
        <p className="text-sm text-gray-600">(Only necessary if still living)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.motherFirstName || ''}
            onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.motherLastName || ''}
            onChange={(e) => handleInputChange('motherLastName', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nationality"
            value={formData.motherNationality || ''}
            onChange={(e) => handleInputChange('motherNationality', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={formData.motherDateOfBirth || ''}
            onChange={(e) => handleInputChange('motherDateOfBirth', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Children */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Children Information</h3>
          <button
            type="button"
            onClick={handleAddChild}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Child
          </button>
        </div>

        {children.map((child: any, index: number) => (
          <div key={index} className="p-6 bg-gray-50 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Child {index + 1}</h4>
              <button
                type="button"
                onClick={() => handleRemoveChild(index)}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={child.firstName || ''}
                onChange={(e) => handleUpdateChild(index, 'firstName', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={child.lastName || ''}
                onChange={(e) => handleUpdateChild(index, 'lastName', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nationality"
                value={child.nationality || ''}
                onChange={(e) => handleUpdateChild(index, 'nationality', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Occupation"
                value={child.occupation || ''}
                onChange={(e) => handleUpdateChild(index, 'occupation', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <input
              type="date"
              placeholder="Date of Birth"
              value={child.dateOfBirth || ''}
              onChange={(e) => handleUpdateChild(index, 'dateOfBirth', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmergencyContactSection({
  formData,
  handleInputChange
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Emergency Contact</h2>
      <p className="text-sm text-gray-600">Must be immediate family or blood relations</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            First Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.emergencyFirstName}
            onChange={(e) => handleInputChange('emergencyFirstName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Last Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.emergencyLastName}
            onChange={(e) => handleInputChange('emergencyLastName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Relationship <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.emergencyRelationship}
          onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="e.g., Spouse, Parent, Sibling"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Phone Number <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          value={formData.emergencyPhone}
          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="+1-555-0000"
        />
      </div>
    </div>
  );
}

function TravelHistorySection({
  formData,
  handleInputChange,
  handleFileChange,
  fileInputRefs
}: {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
  handleFileChange: (field: keyof FormData, files: FileList | null) => void;
  fileInputRefs: any;
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Travel History</h2>

      {/* Been to China */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Have you ever been to China? <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasBeenToChina === true}
              onChange={() => handleInputChange('hasBeenToChina', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasBeenToChina === false}
              onChange={() => handleInputChange('hasBeenToChina', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {/* Previous Visa */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Previous Chinese Visa
        </label>
        <p className="text-sm text-gray-600 mb-4">Upload copy of visa and data page containing Chinese visa</p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          onClick={() => fileInputRefs.previousChineseVisa.current?.click()}
        >
          <input
            ref={fileInputRefs.previousChineseVisa}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('previousChineseVisaFiles', e.target.files)}
            className="hidden"
          />
          <p className="text-gray-600">
            {formData.previousChineseVisaFiles?.length ? `${formData.previousChineseVisaFiles.length} file(s) uploaded` : 'Click to upload (Up to 5 files, Max 10 MB each)'}
          </p>
        </div>
      </div>

      {/* Valid Visas */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Do you currently hold any valid visas from other countries? <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasValidVisas === true}
              onChange={() => handleInputChange('hasValidVisas', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.hasValidVisas === false}
              onChange={() => handleInputChange('hasValidVisas', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>

        {formData.hasValidVisas && (
          <textarea
            placeholder="Please mention countries where you hold valid visas"
            value={formData.validVisaCountries || ''}
            onChange={(e) => handleInputChange('validVisaCountries', e.target.value)}
            className="w-full mt-4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows={3}
          />
        )}
      </div>

      {/* Countries Visited */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Countries visited in the past 12 months
        </label>
        <textarea
          placeholder="List countries you visited"
          value={formData.countriesVisitedLast12Months || ''}
          onChange={(e) => handleInputChange('countriesVisitedLast12Months', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          rows={3}
        />
      </div>
    </div>
  );
}
