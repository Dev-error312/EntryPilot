'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  User,
  FileText,
  Users,
  FolderOpen,
  Building2,
  Settings,
  Clock,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { auditApi } from '@/lib/api';
import { format } from 'date-fns';
import clsx from 'clsx';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

const entityTypeIcons: Record<string, any> = {
  Organization: Building2,
  User: User,
  Group: FolderOpen,
  Applicant: Users,
  Application: FileText,
  Template: FileText,
  Import: FileText,
  System: Settings,
};

const actionLabels: Record<string, string> = {
  CREATE_ORGANIZATION: 'Created organization',
  UPDATE_ORGANIZATION: 'Updated organization',
  ACTIVATE_ORGANIZATION: 'Activated organization',
  DEACTIVATE_ORGANIZATION: 'Deactivated organization',
  CREATE_USER: 'Created user',
  UPDATE_USER: 'Updated user',
  CREATE_GROUP: 'Created group',
  UPDATE_GROUP: 'Updated group',
  ARCHIVE_GROUP: 'Archived group',
  CREATE_APPLICANT: 'Created applicant',
  UPDATE_APPLICANT: 'Updated applicant',
  DELETE_APPLICANT: 'Deleted applicant',
  CREATE_APPLICATION: 'Created application',
  UPDATE_APPLICATION: 'Updated application',
  UPDATE_APPLICATION_STATUS: 'Updated application status',
  CREATE_TEMPLATE: 'Created template',
  UPDATE_TEMPLATE: 'Updated template',
  UPLOAD_IMPORT: 'Uploaded import',
  SEED_DATABASE: 'Seeded database',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page, entityFilter]);

  const loadLogs = async () => {
    try {
      const params: any = { page, limit: 50 };
      if (entityFilter) params.entityType = entityFilter;
      const response = await auditApi.list(params);
      setLogs(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  const entityTypes = ['Organization', 'User', 'Group', 'Applicant', 'Application', 'Template', 'Import'];

  return (
    <DashboardLayout title="Audit Logs" subtitle="Track all system activity">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="">All types</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No activity found
            </h3>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search' : 'Activity will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => {
              const Icon = entityTypeIcons[log.entityType] || FileText;
              const actionLabel = actionLabels[log.action] || log.action.replace(/_/g, ' ').toLowerCase();

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="card p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center 
                                  justify-center flex-shrink-0">
                      {log.user ? (
                        <span className="text-sm font-medium text-gray-600">
                          {log.user.firstName?.[0]}{log.user.lastName?.[0]}
                        </span>
                      ) : (
                        <Icon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                        </span>
                        <span className="text-gray-500">{actionLabel}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon className="w-4 h-4" />
                          {log.entityType}
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {log.newValues && typeof log.newValues === 'object' && (
                        <div className="mt-2 p-2 rounded bg-gray-50 text-xs font-mono 
                                      text-gray-600 overflow-x-auto">
                          {JSON.stringify(log.newValues, null, 2).slice(0, 200)}
                          {JSON.stringify(log.newValues).length > 200 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
