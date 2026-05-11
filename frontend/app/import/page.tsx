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
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { importsApi, groupsApi } from '@/lib/api';
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
}

interface ParsedApplicant {
  data: Record<string, any>;
  confidence: number;
  fieldConfidence: Record<string, number>;
  missingRequired: string[];
  errors: string[];
  source: 'excel' | 'pdf' | 'ocr';
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

interface ProcessResult {
  applicants: ParsedApplicant[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  warnings: string[];
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
  const [dragActive, setDragActive] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewResult, setViewResult] = useState<ProcessResult | null>(null);
  const [expandedApplicant, setExpandedApplicant] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [importsRes, groupsRes] = await Promise.all([
        importsApi.list(),
        groupsApi.listActive(),
      ]);
      setImports(importsRes.data.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
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
    if (file) {
      await uploadFile(file);
    }
  }, [selectedGroup]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
    // Reset input
    e.target.value = '';
  };

  const uploadFile = async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'image/jpeg',
      'image/png',
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
      if (selectedGroup) {
        formData.append('groupId', selectedGroup);
      }

      const response = await importsApi.upload(formData);
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
      const response = await importsApi.process(id);
      setViewResult(response.data);
      setSuccess('Processing complete!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Processing failed');
    } finally {
      setProcessing(null);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/imports/templates/sample/csv', '_blank');
  };

  const viewImportResults = async (id: string) => {
    try {
      const response = await importsApi.results(id);
      if (response.data.data?.applicants) {
        setViewResult(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
    }
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
              <button
                onClick={downloadTemplate}
                className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-900 
                         flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download Sample CSV Template
              </button>
            </div>
          </div>
        </div>

        {/* Group Selection */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Assign to Group (Optional)
          </h3>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="input max-w-md"
          >
            <option value="">Select a group to auto-create applicants</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.code} - {group.name}
              </option>
            ))}
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
            dragActive
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-2 border-gray-200 border-t-gray-900 
                            rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-1">
                Drop files here or{' '}
                <label
                  htmlFor="file-upload"
                  className="text-gray-900 underline cursor-pointer hover:text-gray-600"
                >
                  browse
                </label>
              </p>
              <p className="text-sm text-gray-500">
                Excel (.xlsx, .xls), CSV, PDF, or Images (JPG, PNG) up to 10MB
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel/CSV
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF
                </span>
                <span className="flex items-center gap-1">
                  <Image className="w-4 h-4 text-blue-600" />
                  Image (OCR)
                </span>
              </div>
            </>
          )}
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg bg-green-50 text-green-600 text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
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
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 
                            rounded-full animate-spin mx-auto" />
            </div>
          ) : imports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No imports yet. Upload a file to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {imports.map((imp) => {
                const status = statusConfig[imp.status];
                const FileIcon = fileTypeIcons[imp.fileType] || FileText;
                
                return (
                  <div key={imp.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center 
                                    justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {imp.fileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(imp.fileSize)} •{' '}
                          {format(new Date(imp.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {imp.status === 'COMPLETED' && (
                          <span className="text-sm text-gray-500">
                            {imp.processedCount} applicants imported
                          </span>
                        )}
                        {imp.status === 'PARTIAL' && (
                          <span className="text-sm text-yellow-600">
                            {imp.processedCount} succeeded, {imp.errorCount} failed
                          </span>
                        )}
                        <span className={clsx('badge', status.color)}>
                          <status.icon className="w-3.5 h-3.5 mr-1" />
                          {status.label}
                        </span>
                        {imp.status === 'PENDING' && (
                          <button
                            onClick={() => processImport(imp.id)}
                            disabled={processing === imp.id}
                            className="btn-primary text-sm py-1.5 flex items-center gap-1"
                          >
                            {processing === imp.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 
                                              border-t-white rounded-full animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Process'
                            )}
                          </button>
                        )}
                        {(imp.status === 'COMPLETED' || imp.status === 'PARTIAL') && (
                          <button
                            onClick={() => viewImportResults(imp.id)}
                            className="btn-secondary text-sm py-1.5 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Modal */}
        <AnimatePresence>
          {viewResult && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setViewResult(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 md:inset-10 bg-white rounded-xl shadow-xl z-50 
                          overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Import Results
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {viewResult.totalProcessed} records processed •{' '}
                      {viewResult.successCount} succeeded •{' '}
                      {viewResult.errorCount} with issues
                    </p>
                  </div>
                  <button
                    onClick={() => setViewResult(null)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {viewResult.warnings && viewResult.warnings.length > 0 && (
                    <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                      <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {viewResult.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4">
                    {(Array.isArray(viewResult.applicants) ? viewResult.applicants : []).map((applicant, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedApplicant(
                            expandedApplicant === index ? null : index
                          )}
                          className="w-full p-4 flex items-center justify-between 
                                   hover:bg-gray-50 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              applicant.missingRequired.length === 0
                                ? 'bg-green-100 text-green-600'
                                : 'bg-yellow-100 text-yellow-600'
                            )}>
                              {applicant.missingRequired.length === 0 ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <AlertTriangle className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {applicant.data.given_name || applicant.data.surname
                                  ? `${applicant.data.given_name || ''} ${applicant.data.surname || ''}`.trim()
                                  : `Record ${index + 1}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                Confidence: {applicant.confidence}% • Source: {applicant.source.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          {expandedApplicant === index ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedApplicant === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              <div className="p-4 border-t border-gray-100 bg-gray-50">
                                {applicant.missingRequired.length > 0 && (
                                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm">
                                    <p className="font-medium text-red-800 mb-1">
                                      Missing Required Fields:
                                    </p>
                                    <p className="text-red-600">
                                      {applicant.missingRequired.join(', ')}
                                    </p>
                                  </div>
                                )}

                                {applicant.errors.length > 0 && (
                                  <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-sm">
                                    <p className="font-medium text-yellow-800 mb-1">
                                      Errors:
                                    </p>
                                    <ul className="text-yellow-600 list-disc list-inside">
                                      {applicant.errors.map((e, i) => (
                                        <li key={i}>{e}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  {Object.entries(applicant.data).map(([key, value]) => {
                                    if (!value) return null;
                                    const confidence = applicant.fieldConfidence[key] || 0;
                                    return (
                                      <div key={key}>
                                        <p className="text-gray-500 capitalize">
                                          {key.replace(/_/g, ' ')}
                                        </p>
                                        <p className={clsx(
                                          'font-medium',
                                          confidence < 50 ? 'text-red-600' : 'text-gray-900'
                                        )}>
                                          {String(value)}
                                          {confidence < 80 && (
                                            <span className="text-xs text-gray-400 ml-1">
                                              ({confidence}%)
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Supported Formats Info */}
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center 
                            justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Excel/CSV</h4>
              <p className="text-sm text-gray-500">
                Column headers are automatically matched to China visa form fields. 
                Use our template for best results.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center 
                            justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">PDF Forms</h4>
              <p className="text-sm text-gray-500">
                Text-based PDFs are parsed for form field values. 
                Works best with filled digital forms.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center 
                            justify-center mx-auto mb-3">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Scanned Images (OCR)</h4>
              <p className="text-sm text-gray-500">
                Handwritten or printed forms are scanned using OCR technology. 
                Low-confidence fields are flagged for review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
