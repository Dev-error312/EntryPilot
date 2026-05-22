'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  Mail,
  Phone,
  Globe,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { applicantsApi, groupsApi, visaFormsApi } from '@/lib/api';
import VisaApplicationForm from '@/components/VisaApplicationForm';
import clsx from 'clsx';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  passportNumber: string | null;
  nationality: string | null;
  _count: {
    applications: number;
  };
}

interface GroupedGroup {
  id: string;
  code: string;
  name: string;
  applicants: Applicant[];
  _count: {
    applicants: number;
  };
}

export default function ApplicantsPage() {
  const [groups, setGroups] = useState<GroupedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; applicantId: string; applicantName: string }>({
    open: false,
    applicantId: '',
    applicantName: '',
  });

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    try {
      const response = await applicantsApi.listGrouped();
        const groupsData = response.data?.data || [];
      setGroups(groupsData);
      // Expand first group by default
      if (groupsData.length > 0) {
        setExpandedGroups(new Set([groupsData[0].id]));
      }
    } catch (error) {
      console.error('Failed to load applicants:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ open: true, applicantId: id, applicantName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, applicantId: '', applicantName: '' });
  };

  const confirmDeleteApplicant = async () => {
    const { applicantId } = deleteModal;
    closeDeleteModal();
    setDeleting(applicantId);
    setError(null);
    try {
      await applicantsApi.delete(applicantId);
      loadApplicants();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete applicant';
      setError(errorMsg);
      console.error('Failed to delete applicant:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      applicants: group.applicants.filter(
        (app) =>
          app.firstName.toLowerCase().includes(search.toLowerCase()) ||
          app.lastName.toLowerCase().includes(search.toLowerCase()) ||
          (app.passportNumber?.toLowerCase() ?? '').includes(search.toLowerCase())
      ),
    }))
    .filter(
      (group) =>
        group.code.toLowerCase().includes(search.toLowerCase()) ||
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.applicants.length > 0
    );

  return (
    <DashboardLayout title="Applicants" subtitle="Manage travelers grouped by batch">
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Applicant
          </button>
        </div>

        {/* Grouped List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="space-y-3">
                  <div className="h-12 bg-gray-100 rounded" />
                  <div className="h-12 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applicants found</h3>
            <p className="text-gray-500 mb-4">
              {search ? 'Try adjusting your search' : 'Add your first applicant to get started'}
            </p>
            {!search && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Add Applicant
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: groupIndex * 0.05 }}
                className="card overflow-hidden"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-blue font-mono">{group.code}</span>
                        <span className="font-medium text-gray-900">{group.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{group.applicants.length} applicants</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroupId(group.id);
                        setShowCreateModal(true);
                      }}
                      className="btn-ghost text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                </button>

                {/* Applicants List */}
                <AnimatePresence>
                  {expandedGroups.has(group.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {group.applicants.length === 0 ? (
                        <div className="px-4 py-8 text-center border-t border-gray-100">
                          <p className="text-gray-500">No applicants in this group yet</p>
                        </div>
                      ) : (
                        <div className="border-t border-gray-100">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Passport</th>
                                <th>Nationality</th>
                                <th>Contact</th>
                                <th>Apps</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.applicants.map((applicant) => (
                                <tr key={applicant.id}>
                                  <td>
                                    <Link
                                      href={`/applicants/${applicant.id}`}
                                      className="font-medium text-gray-900 hover:text-gray-600"
                                    >
                                      {applicant.firstName} {applicant.lastName}
                                    </Link>
                                  </td>
                                  <td>
                                    <span className="font-mono text-sm text-gray-600">
                                      {applicant.passportNumber || '-'}
                                    </span>
                                  </td>
                                  <td>
                                    {applicant.nationality ? (
                                      <span className="flex items-center gap-1.5">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        {applicant.nationality}
                                      </span>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  <td>
                                    <div className="flex items-center gap-2">
                                      {applicant.email && (
                                        <a href={`mailto:${applicant.email}`} className="p-1 rounded hover:bg-gray-100" title={applicant.email}>
                                          <Mail className="w-4 h-4 text-gray-400" />
                                        </a>
                                      )}
                                      {applicant.phone && (
                                        <a href={`tel:${applicant.phone}`} className="p-1 rounded hover:bg-gray-100" title={applicant.phone}>
                                          <Phone className="w-4 h-4 text-gray-400" />
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge badge-gray">{applicant._count.applications}</span>
                                  </td>
                                  <td>
                                    <div className="flex items-center gap-1">
                                      <Link href={`/applicants/${applicant.id}`} className="btn-ghost text-sm">
                                        View
                                      </Link>
                                      <button
                                        onClick={() => openDeleteModal(applicant.id, `${applicant.firstName} ${applicant.lastName}`)}
                                        disabled={deleting === applicant.id}
                                        className={clsx(
                                          'p-1.5 rounded-lg transition-colors',
                                          deleting === applicant.id
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                        )}
                                        title="Delete applicant"
                                      >
                                        {deleting === applicant.id ? (
                                          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                                        ) : (
                                          <Trash2 className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <CreateApplicantModal
          open={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedGroupId(null);
          }}
          defaultGroupId={selectedGroupId}
          groups={groups}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedGroupId(null);
            loadApplicants();
          }}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          open={deleteModal.open}
          title="Delete Applicant"
          description="This will permanently delete this applicant and all associated applications."
          itemName={deleteModal.applicantName}
          isLoading={deleting === deleteModal.applicantId}
          onConfirm={confirmDeleteApplicant}
          onCancel={closeDeleteModal}
        />
      </div>
    </DashboardLayout>
  );
}

function CreateApplicantModal({
  open,
  onClose,
  defaultGroupId,
  groups,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  defaultGroupId: string | null;
  groups: GroupedGroup[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVisaSubmit = async (uploadFormData: FormData) => {
    setLoading(true);
    setError('');
    try {
      // Prepare minimal applicant payload from form data
      const fullName = (uploadFormData.get('fullName') as string) || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ') || '';

      const applicantPayload: any = {
        firstName: firstName || 'Unknown',
        lastName: lastName || 'Applicant',
        groupId: (uploadFormData.get('groupId') as string) || defaultGroupId || '',
      };

      const email = uploadFormData.get('residenceEmail') || uploadFormData.get('residence_email') || uploadFormData.get('email');
      const phone = uploadFormData.get('residenceMobilePhone') || uploadFormData.get('residence_mobile_phone') || uploadFormData.get('phone');
      const nationality = uploadFormData.get('placeOfBirthCountry') || uploadFormData.get('nationality');
      const passportNumber = uploadFormData.get('passportNumber');

      if (email) applicantPayload.email = String(email);
      if (phone) applicantPayload.phone = String(phone);
      if (nationality) applicantPayload.nationality = String(nationality);
      if (passportNumber) applicantPayload.passportNumber = String(passportNumber);

      // Create applicant via API (axios handles auth)
      const resp = await applicantsApi.create(applicantPayload);
      const created = resp.data || {};
      const applicantId = created.id || created.data?.id || created["id"] || created["_id"];
      if (!applicantId) {
        // Try common shapes
        const maybeId = resp.data?.data?.id || resp.data?.data?.id;
        if (maybeId) {
          uploadFormData.append('applicantId', String(maybeId));
        }
      } else {
        uploadFormData.append('applicantId', String(applicantId));
      }

      // Ensure groupId exists on form data
      if (!uploadFormData.get('groupId') && applicantPayload.groupId) {
        uploadFormData.append('groupId', applicantPayload.groupId);
      }

      // Get token from sessionStorage or localStorage
      let token = '';
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('visaflow-auth');
        if (stored) {
          try {
            token = JSON.parse(stored)?.state?.token || '';
          } catch {}
        }
        if (!token) token = localStorage.getItem('token') || '';
      }

      // Post visa form (multipart)
      const response = await fetch('/api/visa-forms', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: uploadFormData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to save visa form' }));
        throw new Error(err.message || 'Failed to save visa form');
      }

      // Success
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create applicant and save visa form');
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add New Applicant — Full Form</h2>
                  <p className="text-sm text-gray-500 mt-1">Complete applicant and visa form fields</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={onClose} className="btn-secondary">Cancel</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {error && (
                  <div className="m-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
                )}

                <VisaApplicationForm
                  inline
                  initialData={{ groupId: defaultGroupId || '' }}
                  groups={groups}
                  onSubmit={async (uploadFormData) => {
                    await handleVisaSubmit(uploadFormData);
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
