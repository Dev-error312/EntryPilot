'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Users,
  Calendar,
  User,
  Edit,
  Archive,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { groupsApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Group {
  id: string;
  code: string;
  name: string;
  travelDate: string | null;
  externalAgent: string | null;
  isActive: boolean;
  assignedEmployee: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count: {
    applicants: number;
  };
  createdAt: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupsApi.list({ isActive: true });
      setGroups(response.data.data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.code.toLowerCase().includes(search.toLowerCase()) ||
      group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Groups" subtitle="Manage travel groups and batches">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
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
            New Group
          </button>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No groups found
            </h3>
            <p className="text-gray-500 mb-4">
              {search
                ? 'Try adjusting your search'
                : 'Create your first group to get started'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/groups/${group.id}`}>
                  <div className="card card-hover p-5 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <span className="badge badge-blue font-mono">
                        {group.code}
                      </span>
                      <button className="p-1 rounded hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      {group.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-500">
                      {group.travelDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(group.travelDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {group._count.applicants} applicants
                      </div>
                      {group.assignedEmployee && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {group.assignedEmployee.firstName}{' '}
                          {group.assignedEmployee.lastName}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center 
                                  justify-between">
                      <span className="text-xs text-gray-400">
                        Created {format(new Date(group.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center gap-1 
                                     group-hover:text-gray-900">
                        View
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadGroups();
        }}
      />
    </DashboardLayout>
  );
}

function CreateGroupModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    travelDate: '',
    externalAgent: '',
    notes: '',
    assignedEmployeeId: '',
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadEmployees();
    }
  }, [open]);

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      code: '',
      name: '',
      travelDate: '',
      externalAgent: '',
      notes: '',
      assignedEmployeeId: '',
    });
    setError('');
    onClose();
  };

  const loadEmployees = async () => {
    try {
      const response = await usersApi.list();
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.code.trim()) {
        setError('Group Code is required');
        setLoading(false);
        return;
      }
      if (!formData.name.trim()) {
        setError('Group Name is required');
        setLoading(false);
        return;
      }

      // Get user and organizationId from auth store
      const { user } = useAuthStore.getState();
      if (!user?.organizationId) {
        setError('Organization not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Convert empty strings to null/undefined for optional fields
      const payload: any = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        organizationId: user.organizationId,
      };

      // Only add optional fields if they have values
      if (formData.travelDate) {
        payload.travelDate = new Date(formData.travelDate).toISOString();
      }
      if (formData.externalAgent?.trim()) {
        payload.externalAgent = formData.externalAgent.trim();
      }
      if (formData.notes?.trim()) {
        payload.notes = formData.notes.trim();
      }
      if (formData.assignedEmployeeId) {
        payload.assignedEmployeeId = formData.assignedEmployeeId;
      }

      console.log('Submitting payload:', payload);
      await groupsApi.create(payload);
      
      // Reset form
      setFormData({
        code: '',
        name: '',
        travelDate: '',
        externalAgent: '',
        notes: '',
        assignedEmployeeId: '',
      });
      
      onSuccess();
    } catch (err: any) {
      console.error('Create group error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.details?.[0]?.message || 'Failed to create group';
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
            onClick={handleClose}
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
                  Create New Group
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add a new travel group or batch
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Group Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className="input"
                      placeholder="KMY2026-AUG"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Travel Date
                    </label>
                    <input
                      type="date"
                      value={formData.travelDate}
                      onChange={(e) =>
                        setFormData({ ...formData, travelDate: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input"
                    placeholder="Kailash August Full Moon Batch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    External Agent
                  </label>
                  <input
                    type="text"
                    value={formData.externalAgent}
                    onChange={(e) =>
                      setFormData({ ...formData, externalAgent: e.target.value })
                    }
                    className="input"
                    placeholder="Agent or partner name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Assign Employee
                  </label>
                  <select
                    value={formData.assignedEmployeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedEmployeeId: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
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
                    onClick={handleClose}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Group'}
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
