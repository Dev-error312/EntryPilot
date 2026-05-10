'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FolderOpen,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardApi } from '@/lib/api';
import clsx from 'clsx';

interface Stats {
  activeGroups: number;
  totalApplicants: number;
  pendingImports: number;
  applications: {
    total: number;
    draft: number;
    review: number;
    ready: number;
    submitted: number;
    processing: number;
    approved: number;
    rejected: number;
    delivered: number;
  };
}

const statCards = [
  {
    name: 'Active Groups',
    key: 'activeGroups',
    icon: FolderOpen,
    color: 'bg-blue-500',
    change: '+12%',
    trend: 'up',
  },
  {
    name: 'Total Applicants',
    key: 'totalApplicants',
    icon: Users,
    color: 'bg-green-500',
    change: '+8%',
    trend: 'up',
  },
  {
    name: 'In Review',
    key: 'review',
    icon: Clock,
    color: 'bg-yellow-500',
    parentKey: 'applications',
    change: '-3%',
    trend: 'down',
  },
  {
    name: 'Approved',
    key: 'approved',
    icon: CheckCircle2,
    color: 'bg-emerald-500',
    parentKey: 'applications',
    change: '+24%',
    trend: 'up',
  },
];

const statusCards = [
  { name: 'Draft', key: 'draft', color: 'bg-gray-500', icon: FileCheck },
  { name: 'Review', key: 'review', color: 'bg-yellow-500', icon: Clock },
  { name: 'Ready', key: 'ready', color: 'bg-blue-500', icon: AlertCircle },
  { name: 'Submitted', key: 'submitted', color: 'bg-indigo-500', icon: FileCheck },
  { name: 'Processing', key: 'processing', color: 'bg-purple-500', icon: Clock },
  { name: 'Approved', key: 'approved', color: 'bg-green-500', icon: CheckCircle2 },
  { name: 'Rejected', key: 'rejected', color: 'bg-red-500', icon: XCircle },
  { name: 'Delivered', key: 'delivered', color: 'bg-emerald-500', icon: CheckCircle2 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recent(5),
      ]);
      setStats(statsRes.data);
      setRecentActivity(recentRes.data.recentActivity || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatValue = (card: any) => {
    if (!stats) return 0;
    if (card.parentKey) {
      return (stats as any)[card.parentKey]?.[card.key] || 0;
    }
    return (stats as any)[card.key] || 0;
  };

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your visa processing">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? '-' : getStatValue(card)}
                  </p>
                </div>
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  card.color
                )}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {card.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={clsx(
                  'text-sm font-medium',
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Application Status Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Application Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {statusCards.map((status) => (
              <div
                key={status.key}
                className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 
                         transition-colors cursor-pointer"
              >
                <div className={clsx(
                  'w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center',
                  status.color
                )}>
                  <status.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '-' : (stats?.applications as any)?.[status.key] || 0}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{status.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <a href="/audit" className="text-sm text-gray-500 hover:text-gray-900">
                View all
              </a>
            </div>
            <div className="space-y-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center 
                                  justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {activity.user?.firstName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {activity.user?.firstName} {activity.user?.lastName}
                        </span>
                        {' '}
                        {activity.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/groups/new"
                className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 
                         hover:bg-gray-50 transition-all group"
              >
                <FolderOpen className="w-6 h-6 text-gray-400 group-hover:text-gray-600 
                                     mb-2 transition-colors" />
                <p className="font-medium text-gray-900">New Group</p>
                <p className="text-xs text-gray-500">Create travel batch</p>
              </a>
              <a
                href="/applicants/new"
                className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 
                         hover:bg-gray-50 transition-all group"
              >
                <Users className="w-6 h-6 text-gray-400 group-hover:text-gray-600 
                                mb-2 transition-colors" />
                <p className="font-medium text-gray-900">Add Applicant</p>
                <p className="text-xs text-gray-500">Register new traveler</p>
              </a>
              <a
                href="/import"
                className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 
                         hover:bg-gray-50 transition-all group"
              >
                <TrendingUp className="w-6 h-6 text-gray-400 group-hover:text-gray-600 
                                      mb-2 transition-colors" />
                <p className="font-medium text-gray-900">Import Data</p>
                <p className="text-xs text-gray-500">Upload Excel/CSV/PDF</p>
              </a>
              <a
                href="/applications/new"
                className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 
                         hover:bg-gray-50 transition-all group"
              >
                <FileCheck className="w-6 h-6 text-gray-400 group-hover:text-gray-600 
                                    mb-2 transition-colors" />
                <p className="font-medium text-gray-900">New Application</p>
                <p className="text-xs text-gray-500">Start visa process</p>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
