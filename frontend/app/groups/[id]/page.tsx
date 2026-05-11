'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  Edit,
  Archive,
  FileText,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { groupsApi, applicantsApi } from '@/lib/api';
import { format } from 'date-fns';

interface Group {
  id: string;
  code: string;
  name: string;
  travelDate: string | null;
  externalAgent: string | null;
  notes: string | null;
  isActive: boolean;
  assignedEmployee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  _count: {
    applicants: number;
  };
  createdAt: string;
  organizationId: string;
}

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passport: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await groupsApi.get(groupId);
      const groupData = response.data;
      setGroup(groupData);

      // Load applicants for this group
      try {
        const appResponse = await applicantsApi.listByGroup(groupId);
        setApplicants(appResponse.data.data || []);
      } catch (err) {
        console.error('Failed to load applicants:', err);
      }
    } catch (err: any) {
      console.error('Failed to load group:', err);
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error || !group) {
    return (
      <DashboardLayout title="Error" subtitle="Group not found">
        <div className="card p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Group not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            The group you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={group.name} subtitle={group.code}>
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
              <Archive className="w-4 h-4" />
              {group.isActive ? 'Archive' : 'Restore'}
            </button>
          </div>
        </div>

        {/* Group Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Group Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Group Code
              </label>
              <p className="text-lg font-mono text-gray-900">{group.code}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Group Name
              </label>
              <p className="text-lg text-gray-900">{group.name}</p>
            </div>

            {group.travelDate && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Travel Date
                </label>
                <p className="text-lg text-gray-900">
                  {format(new Date(group.travelDate), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {group.externalAgent && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  External Agent
                </label>
                <p className="text-lg text-gray-900">{group.externalAgent}</p>
              </div>
            )}

            {group.assignedEmployee && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assigned Employee
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {group.assignedEmployee.firstName} {group.assignedEmployee.lastName}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {group.assignedEmployee.email}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {group.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </label>
                <p className="text-gray-700 whitespace-pre-wrap">{group.notes}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                group.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {group.isActive ? 'Active' : 'Archived'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Created
              </label>
              <p className="text-gray-900">
                {format(new Date(group.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Applicants Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Applicants ({group._count.applicants})
            </h2>
            <button className="btn-primary">
              + Add Applicant
            </button>
          </div>

          {applicants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No applicants yet
              </h3>
              <p className="text-gray-500">
                Start adding applicants to this group
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Passport</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((applicant) => (
                    <tr
                      key={applicant.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{applicant.email}</td>
                      <td className="py-3 px-4 text-gray-600">{applicant.phone}</td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-600">
                        {applicant.passport}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
