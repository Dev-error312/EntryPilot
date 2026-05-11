'use client';

import { useEffect, useState } from 'react';
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
  Edit,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicantsApi } from '@/lib/api';
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

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Gender
                </label>
                <p className="text-lg text-gray-900">{applicant.gender}</p>
              </div>
            )}

            {applicant.nationality && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Nationality
                </label>
                <p className="text-lg text-gray-900">{applicant.nationality}</p>
              </div>
            )}

            {applicant.email && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Address
                </label>
                <p className="text-gray-900">{applicant.address}</p>
              </div>
            )}

            {applicant.city && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  City
                </label>
                <p className="text-gray-900">{applicant.city}</p>
              </div>
            )}

            {applicant.country && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
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
            <CreditCard className="w-5 h-5" />
            Passport Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicant.passportNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Passport Number
                </label>
                <p className="text-lg font-mono text-gray-900">
                  {applicant.passportNumber}
                </p>
              </div>
            )}

            {applicant.passportIssue && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Issue Date
                </label>
                <p className="text-lg text-gray-900">
                  {format(new Date(applicant.passportIssue), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {applicant.passportExpiry && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Group Information
          </h2>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-2">
              <span className="font-medium">Code:</span> {applicant.group.code}
            </p>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Name:</span> {applicant.group.name}
            </p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                      <td className="py-3 px-4 text-gray-700">{app.template.name}</td>
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
      </div>
    </DashboardLayout>
  );
}
