'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Bell, Shield, Palette } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuthStore();

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-600">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.firstName}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.lastName}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="input"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Add phone number"
                    className="input"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="btn-primary">Save Changes</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'organization' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization</h2>
              
              {user?.organization ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user.organization.name}
                      className="input"
                      disabled={user.role === 'AGENCY_EMPLOYEE'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Code
                    </label>
                    <input
                      type="text"
                      defaultValue={user.organization.code}
                      className="input"
                      disabled
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No organization assigned</p>
              )}

              {user?.role !== 'AGENCY_EMPLOYEE' && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="btn-primary">Save Changes</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email updates about your applications</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Application Status Updates</p>
                    <p className="text-sm text-gray-500">Get notified when application status changes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Team Activity</p>
                    <p className="text-sm text-gray-500">Notifications about team member actions</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </label>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="btn-primary">Save Preferences</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <input type="password" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <input type="password" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input type="password" className="input" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="btn-primary">Update Password</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-4 rounded-lg border-2 border-gray-900 text-center">
                      <div className="w-full h-12 rounded bg-white border border-gray-200 mb-2" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button className="p-4 rounded-lg border border-gray-200 text-center opacity-50">
                      <div className="w-full h-12 rounded bg-gray-900 mb-2" />
                      <span className="text-sm">Dark</span>
                    </button>
                    <button className="p-4 rounded-lg border border-gray-200 text-center opacity-50">
                      <div className="w-full h-12 rounded bg-gradient-to-b from-white to-gray-900 mb-2" />
                      <span className="text-sm">System</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
