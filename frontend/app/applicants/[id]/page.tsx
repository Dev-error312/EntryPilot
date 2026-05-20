'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  FileText,
  Globe,
  CreditCard,
  User,
  Edit,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicantsApi, visaFormsApi } from '@/lib/api';
import VisaApplicationForm from '@/components/VisaApplicationForm';
import { format } from 'date-fns';

interface Application {
  id: string;
  referenceNumber: string;
  status: string;
  visaType: string;
  destinationCountry: string;
  createdAt: string;
  template: {
    id: string;
    name: string;
  };
}

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  passportIssue: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  group: {
    id: string;
    code: string;
    name: string;
    assignedEmployeeId: string | null;
  };
  applications: Application[];
}

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params.id as string;
  const visaFormSectionRef = useRef<HTMLDivElement | null>(null);

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVisaForm, setShowVisaForm] = useState(false);

  useEffect(() => {
    loadApplicant();
  }, [applicantId]);

  const loadApplicant = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await applicantsApi.get(applicantId);
      console.log('Applicant response:', response.data);
      setApplicant(response.data);
    } catch (err: any) {
      console.error('Failed to load applicant:', err);
      setError(err.response?.data?.message || 'Failed to load applicant');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error || !applicant) {
    return (
      <DashboardLayout title="Error" subtitle="Applicant not found">
        <div className="card p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Applicant not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            The applicant you're looking for doesn't exist or has been deleted.
          </p>
          <button onClick={() => router.back()} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openVisaForm = () => {
    setShowVisaForm(true);
    window.requestAnimationFrame(() => {
      visaFormSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <DashboardLayout
      title={`${applicant.firstName} ${applicant.lastName}`}
      subtitle={applicant.group.code}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={openVisaForm} className="btn-primary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Visa Form
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicant.dob && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                <p className="text-lg text-gray-900">
                  {format(new Date(applicant.dob), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {applicant.gender && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Gender
                </label>
                <p className="text-lg text-gray-900">{applicant.gender}</p>
              </div>
            )}

            {applicant.nationality && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Nationality
                </label>
                <p className="text-lg text-gray-900">{applicant.nationality}</p>
              </div>
            )}

            {applicant.email && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-lg text-blue-600">
                  <a href={`mailto:${applicant.email}`}>{applicant.email}</a>
                </p>
              </div>
            )}

            {applicant.phone && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <p className="text-lg text-blue-600">
                  <a href={`tel:${applicant.phone}`}>{applicant.phone}</a>
                </p>
              </div>
            )}

            {applicant.address && (
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Address
                </label>
                <p className="text-gray-900">{applicant.address}</p>
              </div>
            )}

            {applicant.city && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  City
                </label>
                <p className="text-gray-900">{applicant.city}</p>
              </div>
            )}

            {applicant.country && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Country
                </label>
                <p className="text-gray-900">{applicant.country}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Passport Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Passport Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicant.passportNumber && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Passport Number
                </label>
                <p className="text-lg font-mono text-gray-900">
                  {applicant.passportNumber}
                </p>
              </div>
            )}

            {applicant.passportIssue && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Issue Date
                </label>
                <p className="text-lg text-gray-900">
                  {format(new Date(applicant.passportIssue), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {applicant.passportExpiry && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expiry Date
                </label>
                <p className="text-lg text-gray-900">
                  {format(new Date(applicant.passportExpiry), 'MMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Group Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Group Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Group Code
              </label>
              <p className="text-lg font-mono text-gray-900">{applicant.group.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Group Name
              </label>
              <p className="text-lg text-gray-900">{applicant.group.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Applications Section */}
        {applicant.applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Applications ({applicant.applications.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Reference
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Visa Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Country
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Template
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applicant.applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-mono text-sm text-gray-900">
                        {app.referenceNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{app.visaType}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {app.destinationCountry}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{app.template?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(app.status)}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Notes Section */}
        {applicant.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{applicant.notes}</p>
          </motion.div>
        )}

        <div ref={visaFormSectionRef}>
          {showVisaForm ? (
            <VisaApplicationForm
              inline
              initialData={{
                fullName: `${applicant.firstName} ${applicant.lastName}`,
                placeOfBirthCountry: applicant.nationality || applicant.country || '',
                residenceCountry: applicant.country || applicant.nationality || '',
                residenceMobilePhone: applicant.phone || '',
                residenceEmail: applicant.email || '',
                groupId: applicant.group.id,
              }}
            />
          ) : (
            <VisaFormDraftPanel applicant={applicant} visible={showVisaForm} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function VisaFormDraftPanel({
  applicant,
  visible,
}: {
  applicant: Applicant;
  visible: boolean;
}) {
  const [formData, setFormData] = useState({
    fullName: `${applicant.firstName} ${applicant.lastName}`,
    placeOfBirthCountry: applicant.nationality || applicant.country || '',
    maritalStatus: 'Single',
    currentOccupation: '',
    residenceCountry: applicant.country || applicant.nationality || '',
    residenceMobilePhone: applicant.phone || '',
    residenceEmail: applicant.email || '',
    emergencyFirstName: '',
    emergencyLastName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required');
      }

      const payload = {
        applicantId: applicant.id,
        groupId: applicant.group.id,
        fullName: formData.fullName.trim(),
        placeOfBirthCountry: formData.placeOfBirthCountry.trim() || undefined,
        maritalStatus: formData.maritalStatus,
        currentOccupation: formData.currentOccupation.trim() || undefined,
        residenceCountry: formData.residenceCountry.trim() || undefined,
        residenceMobilePhone: formData.residenceMobilePhone.trim() || undefined,
        residenceEmail: formData.residenceEmail.trim() || undefined,
        emergencyFirstName: formData.emergencyFirstName.trim() || undefined,
        emergencyLastName: formData.emergencyLastName.trim() || undefined,
        emergencyRelationship: formData.emergencyRelationship.trim() || undefined,
        emergencyPhone: formData.emergencyPhone.trim() || undefined,
      };

      const response = await visaFormsApi.create(payload);
      setSuccess(`Visa form draft created successfully. Draft ID: ${response.data?.data?.id || 'saved'}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create visa form draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className={`card p-6 ${visible ? 'ring-2 ring-blue-100' : ''}`}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Visa Form</h2>
          <p className="text-sm text-gray-600">
            Create a draft for this applicant without leaving the applicant page.
          </p>
        </div>
        <span className="badge badge-blue">Draft</span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>
      )}

      <form onSubmit={submitDraft} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Place of Birth Country</label>
            <input
              value={formData.placeOfBirthCountry}
              onChange={(e) => updateField('placeOfBirthCountry', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Marital Status</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => updateField('maritalStatus', e.target.value)}
              className="input"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Occupation</label>
            <input
              value={formData.currentOccupation}
              onChange={(e) => updateField('currentOccupation', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Residence Country</label>
            <input
              value={formData.residenceCountry}
              onChange={(e) => updateField('residenceCountry', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Residence Mobile Phone</label>
            <input
              value={formData.residenceMobilePhone}
              onChange={(e) => updateField('residenceMobilePhone', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Residence Email</label>
            <input
              type="email"
              value={formData.residenceEmail}
              onChange={(e) => updateField('residenceEmail', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input
                value={formData.emergencyFirstName}
                onChange={(e) => updateField('emergencyFirstName', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input
                value={formData.emergencyLastName}
                onChange={(e) => updateField('emergencyLastName', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Relationship</label>
              <input
                value={formData.emergencyRelationship}
                onChange={(e) => updateField('emergencyRelationship', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                value={formData.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-sm text-gray-500">
            The draft is attached to {applicant.firstName} {applicant.lastName} and their group.
          </p>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Visa Draft'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
