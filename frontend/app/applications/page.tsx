'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Globe,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicationsApi, applicantsApi } from '@/lib/api';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Application {
  id: string;
  referenceNumber: string;
  visaType: string;
  destinationCountry: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    passportNumber: string | null;
    nationality: string | null;
    group: {
      id: string;
      code: string;
      name: string;
    };
  };
  template: {
    id: string;
    name: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'status-draft', icon: FileText },
  REVIEW: { label: 'In Review', color: 'status-review', icon: Clock },
  READY: { label: 'Ready', color: 'status-ready', icon: AlertCircle },
  SUBMITTED: { label: 'Submitted', color: 'status-submitted', icon: FileText },
  PROCESSING: { label: 'Processing', color: 'status-processing', icon: Clock },
  APPROVED: { label: 'Approved', color: 'status-approved', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'status-rejected', icon: XCircle },
  DELIVERED: { label: 'Delivered', color: 'status-delivered', icon: CheckCircle2 },
};

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      const params: any = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const response = await applicationsApi.list(params);
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.firstName.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.lastName.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.passportNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Applications" subtitle="Track visa applications">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={clsx(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    statusFilter === filter.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Application
          </button>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="card overflow-hidden">
            <div className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 border-b border-gray-100 bg-gray-50"
                />
              ))}
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No applications found
            </h3>
            <p className="text-gray-500 mb-4">
              {search
                ? 'Try adjusting your search'
                : 'Create your first application to get started'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Application
              </button>
            )}
          </div>
        ) : (
          <div className="card table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Group</th>
                  <th>Visa Type</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app, index) => {
                  const status = statusConfig[app.status];
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <td>
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-mono text-sm text-gray-900 hover:text-gray-600"
                        >
                          {app.referenceNumber}
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={`/applicants/${app.applicant.id}`}
                          className="font-medium text-gray-900 hover:text-gray-600"
                        >
                          {app.applicant.firstName} {app.applicant.lastName}
                        </Link>
                        {app.applicant.passportNumber && (
                          <p className="text-xs text-gray-500 font-mono">
                            {app.applicant.passportNumber}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-blue font-mono">
                          {app.applicant.group.code}
                        </span>
                      </td>
                      <td>{app.visaType}</td>
                      <td>
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-gray-400" />
                          {app.destinationCountry}
                        </span>
                      </td>
                      <td>
                        <span className={clsx('badge', status.color)}>
                          <StatusIcon className="w-3.5 h-3.5 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <Link
                          href={`/applications/${app.id}`}
                          className="btn-ghost text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateApplicationModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadApplications();
        }}
      />
    </DashboardLayout>
  );
}

function CreateApplicationModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    applicantId: '',
    visaType: '',
    destinationCountry: '',
    templateId: '',
    notes: '',
  });
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadApplicants();
    }
  }, [open]);

  const loadApplicants = async () => {
    try {
      const response = await applicantsApi.list({ limit: 100 });
      setApplicants(response.data.data);
    } catch (error) {
      console.error('Failed to load applicants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await applicationsApi.create({
        ...formData,
        notes: formData.notes || undefined,
        templateId: formData.templateId || undefined,
      });
      setFormData({
        applicantId: '',
        visaType: '',
        destinationCountry: '',
        templateId: '',
        notes: '',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const visaTypes = ['Tourist', 'Business', 'Work', 'Student', 'Transit', 'Pilgrimage'];
  const countries = [
    'Thailand', 'China', 'India', 'Nepal', 'USA', 'UK', 'Schengen',
    'Australia', 'Japan', 'Singapore', 'Malaysia', 'Dubai'
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl 
                          w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New Application
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Start a new visa application
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Applicant *
                  </label>
                  <select
                    value={formData.applicantId}
                    onChange={(e) =>
                      setFormData({ ...formData, applicantId: e.target.value })
                    }
                    className="input"
                    required
                  >
                    <option value="">Select applicant</option>
                    {applicants.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.firstName} {app.lastName} - {app.group?.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Visa Type *
                    </label>
                    <select
                      value={formData.visaType}
                      onChange={(e) =>
                        setFormData({ ...formData, visaType: e.target.value })
                      }
                      className="input"
                      required
                    >
                      <option value="">Select type</option>
                      {visaTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Destination *
                    </label>
                    <select
                      value={formData.destinationCountry}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationCountry: e.target.value })
                      }
                      className="input"
                      required
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="input min-h-[80px]"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Application'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
