'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FileText,
  Globe,
  Layers,
  Edit,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { templatesApi, organizationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Template {
  id: string;
  name: string;
  country: string;
  visaType: string;
  description: string | null;
  fields: any[];
  version: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    applications: number;
  };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; templateId: string; templateName: string }>({
    open: false,
    templateId: '',
    templateName: '',
  });
  const { user } = useAuthStore();

  useEffect(() => {
    loadTemplates();
    if (user?.role === 'SUPER_ADMIN') {
      loadOrganizations();
    }
  }, [user?.role]);

  const loadTemplates = async () => {
    try {
      const response = await templatesApi.list();
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await organizationsApi.list();
      setOrganizations(response.data.data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const toggleTemplate = async (id: string) => {
    try {
      await templatesApi.toggle(id);
      loadTemplates();
    } catch (error) {
      console.error('Failed to toggle template:', error);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ open: true, templateId: id, templateName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, templateId: '', templateName: '' });
  };

  const confirmDeleteTemplate = async () => {
    const { templateId } = deleteModal;
    closeDeleteModal();
    setDeleting(templateId);
    setError(null);
    try {
      await templatesApi.delete(templateId);
      loadTemplates();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete template';
      setError(errorMsg);
      console.error('Failed to delete template:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.country.toLowerCase().includes(search.toLowerCase()) ||
      t.visaType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Templates" subtitle="Manage visa form templates">
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
              placeholder="Search templates..."
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
            New Template
          </button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No templates found
            </h3>
            <p className="text-gray-500 mb-4">
              {search ? 'Try adjusting your search' : 'Create your first template'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="card card-hover p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-blue">
                      <Globe className="w-3 h-3 mr-1" />
                      {template.country}
                    </span>
                    <span className="badge badge-gray">{template.visaType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTemplate(template.id)}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        template.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      )}
                      title={template.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {template.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => openDeleteModal(template.id, template.name)}
                      disabled={deleting === template.id}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors',
                        deleting === template.id
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      )}
                      title="Delete template"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Layers className="w-4 h-4" />
                    {template.fields.length} fields
                  </span>
                  <span>v{template.version}</span>
                  <span>{template._count.applications} uses</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Created {format(new Date(template.createdAt), 'MMM d, yyyy')}
                  </span>
                  <button className="btn-ghost text-sm flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateTemplateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadTemplates();
        }}
        isSuperAdmin={user?.role === 'SUPER_ADMIN'}
        organizations={organizations}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={deleteModal.open}
        title="Delete Template"
        description="This template will be permanently removed and can no longer be used for new applications."
        itemName={deleteModal.templateName}
        isLoading={deleting === deleteModal.templateId}
        onConfirm={confirmDeleteTemplate}
        onCancel={closeDeleteModal}
      />
    </DashboardLayout>
  );
}

function CreateTemplateModal({
  open,
  onClose,
  onSuccess,
  isSuperAdmin = false,
  organizations = [],
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSuperAdmin?: boolean;
  organizations?: any[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    visaType: '',
    description: '',
    organizationId: '',
    fields: [
      { id: 'passport', label: 'Passport Number', type: 'text', required: true },
      { id: 'arrival', label: 'Arrival Date', type: 'date', required: true },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSuperAdmin && !formData.organizationId) {
      setError('Please select an organization');
      setLoading(false);
      return;
    }

    try {
      const submitData = isSuperAdmin 
        ? { ...formData, organizationId: formData.organizationId }
        : formData;
      await templatesApi.create(submitData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    'Thailand', 'China', 'India', 'Nepal', 'USA', 'UK', 'Schengen',
    'Australia', 'Japan', 'Singapore', 'Malaysia', 'Dubai'
  ];

  const visaTypes = ['Tourist', 'Business', 'Work', 'Student', 'Transit', 'Pilgrimage'];

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
                          w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create Template
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input"
                    placeholder="Thailand Tourist Visa"
                    required
                  />
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organization *
                    </label>
                    <select
                      value={formData.organizationId}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationId: e.target.value })
                      }
                      className="input"
                      required
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="input"
                      required
                    >
                      <option value="">Select country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
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
                      {visaTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input min-h-[80px]"
                    placeholder="Template description..."
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
                    {loading ? 'Creating...' : 'Create Template'}
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
