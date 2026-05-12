'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Building2,
  Users,
  FolderOpen,
  FileCheck,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { organizationsApi } from '@/lib/api';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Organization {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string | null;
  maxSeats: number;
  usedSeats: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
    groups: number;
    applicants: number;
    applications: number;
  };
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await organizationsApi.list();
      setOrganizations(response.data.data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrganization = async (id: string) => {
    try {
      await organizationsApi.toggle(id);
      loadOrganizations();
    } catch (error) {
      console.error('Failed to toggle organization:', error);
    }
  };

  const deleteOrganization = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    setDeleting(id);
    setError(null);
    try {
      await organizationsApi.delete(id);
      loadOrganizations();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete organization';
      setError(errorMsg);
      console.error('Failed to delete organization:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.code.toLowerCase().includes(search.toLowerCase()) ||
      org.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Organizations" subtitle="Manage agencies and clients">
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
            <div className="flex items-center justify-between">
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Organization
          </button>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-4" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-gray-100 rounded" />
                  <div className="h-12 bg-gray-100 rounded" />
                  <div className="h-12 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No organizations found
            </h3>
            <p className="text-gray-500 mb-4">
              {search ? 'Try adjusting your search' : 'Create your first organization'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Organization
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrgs.map((org, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-blue font-mono">{org.code}</span>
                      {!org.isActive && (
                        <span className="badge badge-red">Inactive</span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">{org.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleOrganization(org.id)}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        org.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      )}
                      title={org.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {org.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteOrganization(org.id, org.name)}
                      disabled={deleting === org.id}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        deleting === org.id
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      )}
                      title="Delete organization"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {org.email}
                  </div>
                  {org.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {org.phone}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900">
                      {org._count.users}
                    </p>
                    <p className="text-xs text-gray-500">Users</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <FolderOpen className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900">
                      {org._count.groups}
                    </p>
                    <p className="text-xs text-gray-500">Groups</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900">
                      {org._count.applicants}
                    </p>
                    <p className="text-xs text-gray-500">Apps</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <FileCheck className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900">
                      {org._count.applications}
                    </p>
                    <p className="text-xs text-gray-500">Visas</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Seats</span>
                    <span className="font-medium text-gray-900">
                      {org.usedSeats} / {org.maxSeats}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all',
                        org.usedSeats >= org.maxSeats
                          ? 'bg-red-500'
                          : org.usedSeats >= org.maxSeats * 0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      )}
                      style={{
                        width: `${Math.min(100, (org.usedSeats / org.maxSeats) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateOrgModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadOrganizations();
        }}
      />
    </DashboardLayout>
  );
}

function CreateOrgModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    maxSeats: 10,
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await organizationsApi.create(formData);
      setFormData({
        name: '',
        code: '',
        email: '',
        phone: '',
        maxSeats: 10,
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
        adminPassword: '',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
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
                  Create Organization
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add a new agency and their admin account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Organization Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Organization Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Code *
                        </label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value.toUpperCase() })
                          }
                          className="input"
                          placeholder="ACME"
                          maxLength={10}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="input"
                          required
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Max Seats
                      </label>
                      <input
                        type="number"
                        value={formData.maxSeats}
                        onChange={(e) =>
                          setFormData({ ...formData, maxSeats: parseInt(e.target.value) })
                        }
                        className="input max-w-[120px]"
                        min={1}
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Account */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Admin Account
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.adminFirstName}
                          onChange={(e) =>
                            setFormData({ ...formData, adminFirstName: e.target.value })
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
                          value={formData.adminLastName}
                          onChange={(e) =>
                            setFormData({ ...formData, adminLastName: e.target.value })
                          }
                          className="input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, adminEmail: e.target.value })
                          }
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={formData.adminPassword}
                          onChange={(e) =>
                            setFormData({ ...formData, adminPassword: e.target.value })
                          }
                          className="input"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
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
                    {loading ? 'Creating...' : 'Create Organization'}
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
