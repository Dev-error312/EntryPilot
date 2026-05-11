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
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { applicantsApi, groupsApi } from '@/lib/api';
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

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    try {
      const response = await applicantsApi.listGrouped();
      setGroups(response.data);
      // Expand first group by default
      if (response.data.length > 0) {
        setExpandedGroups(new Set([response.data[0].id]));
      }
    } catch (error) {
      console.error('Failed to load applicants:', error);
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

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      applicants: group.applicants.filter(
        (app) =>
          app.firstName.toLowerCase().includes(search.toLowerCase()) ||
          app.lastName.toLowerCase().includes(search.toLowerCase()) ||
          app.passportNumber?.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(
      (group) =>
        group.code.toLowerCase().includes(search.toLowerCase()) ||
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.applicants.length > 0
    );

  return (
    <DashboardLayout 
      title="Applicants" 
      subtitle="Manage travelers grouped by batch"
    >
      <div className="space-y-6">
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No applicants found
            </h3>
            <p className="text-gray-500 mb-4">
              {search
                ? 'Try adjusting your search'
                : 'Add your first applicant to get started'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
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
                <div
                  onClick={() => toggleGroup(group.id)}
                  className="w-full p-4 flex items-center justify-between 
                           hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-blue font-mono">
                          {group.code}
                        </span>
                        <span className="font-medium text-gray-900">
                          {group.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {group._count.applicants} applicants
                    </span>
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
                </div>

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
                          <p className="text-gray-500">
                            No applicants in this group yet
                          </p>
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
                                <th>Applications</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.applicants.map((applicant) => (
                                <tr key={applicant.id}>
                                  <td>
                                    <Link
                                      href={`/applicants/${applicant.id}`}
                                      className="font-medium text-gray-900 
                                               hover:text-gray-600"
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
                                        <a
                                          href={`mailto:${applicant.email}`}
                                          className="p-1 rounded hover:bg-gray-100"
                                          title={applicant.email}
                                        >
                                          <Mail className="w-4 h-4 text-gray-400" />
                                        </a>
                                      )}
                                      {applicant.phone && (
                                        <a
                                          href={`tel:${applicant.phone}`}
                                          className="p-1 rounded hover:bg-gray-100"
                                          title={applicant.phone}
                                        >
                                          <Phone className="w-4 h-4 text-gray-400" />
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge badge-gray">
                                      {applicant._count.applications}
                                    </span>
                                  </td>
                                  <td>
                                    <Link
                                      href={`/applicants/${applicant.id}`}
                                      className="btn-ghost text-sm"
                                    >
                                      View
                                    </Link>
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
      </div>

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    groupId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && defaultGroupId) {
      setFormData((prev) => ({ ...prev, groupId: defaultGroupId }));
    }
  }, [open, defaultGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.firstName.trim()) {
        setError('First Name is required');
        setLoading(false);
        return;
      }
      if (!formData.lastName.trim()) {
        setError('Last Name is required');
        setLoading(false);
        return;
      }
      if (!formData.groupId) {
        setError('Group is required');
        setLoading(false);
        return;
      }

      // Build payload with proper date formatting
      const data: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        groupId: formData.groupId,
      };

      // Add optional fields only if they have values
      if (formData.email?.trim()) {
        data.email = formData.email.trim();
      }
      if (formData.phone?.trim()) {
        data.phone = formData.phone.trim();
      }
      if (formData.dob) {
        // Convert date string to ISO datetime
        data.dob = new Date(formData.dob).toISOString();
      }
      if (formData.gender) {
        data.gender = formData.gender;
      }
      if (formData.nationality?.trim()) {
        data.nationality = formData.nationality.trim();
      }
      if (formData.passportNumber?.trim()) {
        data.passportNumber = formData.passportNumber.trim();
      }
      if (formData.passportExpiry) {
        // Convert date string to ISO datetime
        data.passportExpiry = new Date(formData.passportExpiry).toISOString();
      }

      console.log('Submitting applicant:', data);
      await applicantsApi.create(data);
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        nationality: '',
        passportNumber: '',
        passportExpiry: '',
        groupId: '',
      });
      onSuccess();
    } catch (err: any) {
      console.error('Create applicant error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.details?.[0]?.message || 'Failed to create applicant';
      setError(errorMsg);
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl 
                          w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Add New Applicant
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter applicant details
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Group *
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                    className="input"
                    required
                  >
                    <option value="">Select group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.code} - {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) =>
                        setFormData({ ...formData, nationality: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={formData.passportNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, passportNumber: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Passport Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.passportExpiry}
                      onChange={(e) =>
                        setFormData({ ...formData, passportExpiry: e.target.value })
                      }
                      className="input"
                    />
                  </div>
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
                    {loading ? 'Adding...' : 'Add Applicant'}
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
