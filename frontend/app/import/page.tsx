'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Download,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Edit,
  Save,
  Users,
  User,
  Mail,
  Phone,
  Globe,
  FileCheck,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { importsApi, groupsApi, applicantsApi } from '@/lib/api';
import { format } from 'date-fns';
import clsx from 'clsx';

interface ImportRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  totalCount: number;
  processedCount: number;
  errorCount: number;
  createdAt: string;
  metadata?: any;
  groupId?: string;
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
  documents: any;
  group: {
    id: string;
    code: string;
    name: string;
  };
}

interface ParsedApplicant {
  data: Record<string, any>;
  confidence: number;
  fieldConfidence: Record<string, number>;
  missingRequired: string[];
  errors: string[];
  source: 'excel' | 'pdf' | 'ocr';
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Clock },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  PARTIAL: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
};

const fileTypeIcons: Record<string, any> = {
  'application/pdf': FileText,
  'text/csv': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/vnd.ms-excel': FileSpreadsheet,
  'image/jpeg': Image,
  'image/png': Image,
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ImportPage() {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewImportId, setViewImportId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<{
    import: ImportRecord;
    applicants: Applicant[];
    parsedApplicants: ParsedApplicant[];
  } | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; importId: string; importName: string }>({
    open: false,
    importId: '',
    importName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [importsRes, groupsRes] = await Promise.all([
        importsApi.list(),
        groupsApi.listActive(),
      ]);
      setImports(importsRes.data?.data || []);

      const groupsArray = groupsRes?.data?.data || groupsRes?.data || [];
      if (Array.isArray(groupsArray)) {
        setGroups(groupsArray);
      } else {
        console.warn('Unexpected groups response format:', groupsRes);
        setGroups([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load imports and groups');
      setImports([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }, [selectedGroup]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  const uploadFile = async (file: File) => {
    const allowedTypes = [
      'application/pdf', 'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel', 'image/jpeg', 'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Supported: PDF, Excel (.xlsx, .xls), CSV, Images (JPG, PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedGroup) formData.append('groupId', selectedGroup);

      await importsApi.upload(formData);
      setSuccess(`"${file.name}" uploaded successfully! Click "Process" to extract data.`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const processImport = async (id: string) => {
    setProcessing(id);
    setError('');
    setSuccess('');
    try {
      await importsApi.process(id);
      setSuccess('Processing complete!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Processing failed');
    } finally {
      setProcessing(null);
    }
  };

  const openDeleteModal = (id: string, fileName: string) => {
    setDeleteModal({ open: true, importId: id, importName: fileName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, importId: '', importName: '' });
  };

  const confirmDeleteImport = async () => {
    const { importId } = deleteModal;
    closeDeleteModal();
    setDeleting(importId);
    try {
      await importsApi.delete(importId);
      setSuccess('Import deleted successfully');
      loadData();
      if (viewImportId === importId) {
        setViewImportId(null);
        setViewData(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const viewImportDetails = async (id: string) => {
    setViewImportId(id);
    setLoadingView(true);
    try {
      const response = await importsApi.getApplicants(id);
      setViewData(response.data);
    } catch (err: any) {
      setError('Failed to load import details');
      setViewImportId(null);
    } finally {
      setLoadingView(false);
    }
  };

  const startEditing = (applicant: Applicant) => {
    setEditingApplicant(applicant.id);
    setEditData({
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email || '',
      phone: applicant.phone || '',
      dob: applicant.dob ? applicant.dob.split('T')[0] : '',
      gender: applicant.gender || '',
      nationality: applicant.nationality || '',
      passportNumber: applicant.passportNumber || '',
      passportIssue: applicant.passportIssue ? applicant.passportIssue.split('T')[0] : '',
      passportExpiry: applicant.passportExpiry ? applicant.passportExpiry.split('T')[0] : '',
      address: applicant.address || '',
    });
  };

  const saveApplicant = async (id: string) => {
    setSaving(true);
    try {
      await applicantsApi.update(id, {
        ...editData,
        dob: editData.dob || undefined,
        passportIssue: editData.passportIssue || undefined,
        passportExpiry: editData.passportExpiry || undefined,
      });
      setSuccess('Applicant updated successfully');
      setEditingApplicant(null);
      // Reload view data
      if (viewImportId) {
        const response = await importsApi.getApplicants(viewImportId);
        setViewData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditingApplicant(null);
    setEditData({});
  };

  const downloadTemplate = () => {
    window.open('/api/imports/templates/sample/csv', '_blank');
  };

  return (
    <DashboardLayout 
      title="Import" 
      subtitle="Import China visa applications from Excel, PDF, or scanned forms"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="card p-4 bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">China Visa Form Import</h3>
              <p className="text-sm text-blue-700 mt-1">
                Import applicants from China Visa Application Form V.2013. 
                Supports Excel/CSV files, PDF forms, and scanned images with OCR.
              </p>
              <button onClick={downloadTemplate} className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1">
                <Download className="w-4 h-4" />
                Download Sample CSV Template
              </button>
            </div>
          </div>
        </div>

        {/* Group Selection */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Assign to Group (Optional)</h3>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="input max-w-md"
            disabled={loading || !Array.isArray(groups)}
          >
            <option value="">
              {loading ? 'Loading groups...' : 'Select a group to auto-create applicants'}
            </option>
            {Array.isArray(groups) && groups.length > 0 ? (
              groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.code} - {group.name}
                </option>
              ))
            ) : (
              !loading && <option disabled>No groups available</option>
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            If selected, applicants will be automatically created from the imported data
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={clsx(
            'card p-12 border-2 border-dashed text-center transition-all cursor-pointer',
            dragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <input type="file" id="file-upload" className="hidden" accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png" onChange={handleFileInput} disabled={uploading} />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-1">
                Drop files here or{' '}
                <label htmlFor="file-upload" className="text-gray-900 underline cursor-pointer hover:text-gray-600">browse</label>
              </p>
              <p className="text-sm text-gray-500">Excel (.xlsx, .xls), CSV, PDF, or Images (JPG, PNG) up to 10MB</p>
            </>
          )}
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
              <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-green-50 text-green-600 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import History */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Import History</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          ) : imports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No imports yet. Upload a file to get started.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {imports.map((imp) => {
                const status = statusConfig[imp.status];
                const FileIcon = fileTypeIcons[imp.fileType] || FileText;
                
                return (
                  <div key={imp.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{imp.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(imp.fileSize)} • {format(new Date(imp.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {imp.status === 'COMPLETED' && (
                          <span className="text-sm text-gray-500">{imp.processedCount} applicants</span>
                        )}
                        {imp.status === 'PARTIAL' && (
                          <span className="text-sm text-yellow-600">{imp.processedCount} ok, {imp.errorCount} issues</span>
                        )}
                        <span className={clsx('badge', status.color)}>
                          <status.icon className="w-3.5 h-3.5 mr-1" />
                          {status.label}
                        </span>
                        
                        {imp.status === 'PENDING' && (
                          <button onClick={() => processImport(imp.id)} disabled={processing === imp.id}
                            className="btn-primary text-sm py-1.5">
                            {processing === imp.id ? 'Processing...' : 'Process'}
                          </button>
                        )}
                        
                        {(imp.status === 'COMPLETED' || imp.status === 'PARTIAL') && (
                          <button onClick={() => viewImportDetails(imp.id)}
                            className="btn-secondary text-sm py-1.5 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        )}
                        
                        <button onClick={() => openDeleteModal(imp.id, imp.fileName)} disabled={deleting === imp.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete import">
                          {deleting === imp.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* View Applicants Modal */}
      <AnimatePresence>
        {viewImportId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => { setViewImportId(null); setViewData(null); setEditingApplicant(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-8 bg-white rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Import Details</h2>
                  {viewData && (
                    <p className="text-sm text-gray-500 mt-1">
                      {viewData.import.fileName} • {viewData.applicants.length} applicants imported
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {viewData && (
                    <button onClick={() => openDeleteModal(viewData.import.id, viewData.import.fileName)}
                      className="btn-danger text-sm py-1.5 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete Import
                    </button>
                  )}
                  <button onClick={() => { setViewImportId(null); setViewData(null); setEditingApplicant(null); }}
                    className="p-2 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingView ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                ) : viewData && viewData.applicants.length > 0 ? (
                  <div className="space-y-4">
                    {viewData.applicants.map((applicant) => (
                      <div key={applicant.id} className="card p-4">
                        {editingApplicant === applicant.id ? (
                          /* Edit Mode */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Edit Applicant</h4>
                              <div className="flex items-center gap-2">
                                <button onClick={cancelEditing} className="btn-secondary text-sm">Cancel</button>
                                <button onClick={() => saveApplicant(applicant.id)} disabled={saving}
                                  className="btn-primary text-sm flex items-center gap-1">
                                  {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                  Save
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input type="text" value={editData.firstName} onChange={(e) => setEditData({...editData, firstName: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input type="text" value={editData.lastName} onChange={(e) => setEditData({...editData, lastName: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input type="date" value={editData.dob} onChange={(e) => setEditData({...editData, dob: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select value={editData.gender} onChange={(e) => setEditData({...editData, gender: e.target.value})} className="input">
                                  <option value="">Select</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                                <input type="text" value={editData.nationality} onChange={(e) => setEditData({...editData, nationality: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                                <input type="text" value={editData.passportNumber} onChange={(e) => setEditData({...editData, passportNumber: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Issue Date</label>
                                <input type="date" value={editData.passportIssue} onChange={(e) => setEditData({...editData, passportIssue: e.target.value})} className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                                <input type="date" value={editData.passportExpiry} onChange={(e) => setEditData({...editData, passportExpiry: e.target.value})} className="input" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input type="text" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} className="input" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {applicant.firstName?.[0]}{applicant.lastName?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {applicant.firstName} {applicant.lastName}
                                  </h4>
                                  <span className="badge badge-blue text-xs">{applicant.group?.code}</span>
                                </div>
                              </div>
                              <button onClick={() => startEditing(applicant)}
                                className="btn-ghost text-sm flex items-center gap-1">
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {applicant.email && (
                                <div>
                                  <p className="text-gray-500">Email</p>
                                  <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400" />{applicant.email}</p>
                                </div>
                              )}
                              {applicant.phone && (
                                <div>
                                  <p className="text-gray-500">Phone</p>
                                  <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{applicant.phone}</p>
                                </div>
                              )}
                              {applicant.passportNumber && (
                                <div>
                                  <p className="text-gray-500">Passport</p>
                                  <p className="font-mono">{applicant.passportNumber}</p>
                                </div>
                              )}
                              {applicant.nationality && (
                                <div>
                                  <p className="text-gray-500">Nationality</p>
                                  <p className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-gray-400" />{applicant.nationality}</p>
                                </div>
                              )}
                              {applicant.gender && (
                                <div>
                                  <p className="text-gray-500">Gender</p>
                                  <p>{applicant.gender}</p>
                                </div>
                              )}
                              {applicant.dob && (
                                <div>
                                  <p className="text-gray-500">Date of Birth</p>
                                  <p>{format(new Date(applicant.dob), 'MMM d, yyyy')}</p>
                                </div>
                              )}
                              {applicant.passportExpiry && (
                                <div>
                                  <p className="text-gray-500">Passport Expires</p>
                                  <p>{format(new Date(applicant.passportExpiry), 'MMM d, yyyy')}</p>
                                </div>
                              )}
                              {applicant.documents?.confidence && (
                                <div>
                                  <p className="text-gray-500">Import Confidence</p>
                                  <p className={clsx(
                                    applicant.documents.confidence >= 80 ? 'text-green-600' :
                                    applicant.documents.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                                  )}>
                                    {applicant.documents.confidence}%
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : viewData && viewData.parsedApplicants.length > 0 ? (
                  /* Show parsed but not created applicants */
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-yellow-800 font-medium">These applicants have issues and were not created</p>
                      <p className="text-yellow-700 text-sm">Fix the missing fields and re-import</p>
                    </div>
                    {viewData.parsedApplicants.filter(p => p.missingRequired.length > 0).map((parsed, idx) => (
                      <div key={idx} className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">
                            {parsed.data.given_name || parsed.data.surname || `Record ${idx + 1}`}
                          </span>
                          <span className="text-sm text-gray-500">• Confidence: {parsed.confidence}%</span>
                        </div>
                        <div className="text-sm text-red-600">
                          <p className="font-medium">Missing required fields:</p>
                          <p>{parsed.missingRequired.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No applicants in this import</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
