'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderOpen,
  FileText,
  FileCheck,
  Upload,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  Plane,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Groups', href: '/groups', icon: FolderOpen },
  { name: 'Applicants', href: '/applicants', icon: Users },
  { name: 'Applications', href: '/applications', icon: FileCheck },
  { name: 'Templates', href: '/templates', icon: FileText, roles: ['SUPER_ADMIN', 'AGENCY_ADMIN'] },
  { name: 'Import', href: '/import', icon: Upload, roles: ['SUPER_ADMIN', 'AGENCY_ADMIN'] },
  { name: 'Audit Logs', href: '/audit', icon: ClipboardList, roles: ['SUPER_ADMIN', 'AGENCY_ADMIN'] },
];

const adminNavigation: NavItem[] = [
  { name: 'Organizations', href: '/organizations', icon: Building2, roles: ['SUPER_ADMIN'] },
  { name: 'Team', href: '/team', icon: UserPlus, roles: ['SUPER_ADMIN', 'AGENCY_ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const canAccess = (item: NavItem) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  const filteredNavigation = navigation.filter(canAccess);
  const filteredAdminNav = adminNavigation.filter(canAccess);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0 relative"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden"
                >
                  VisaFlow
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                  isActive(item.href)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <item.icon className={clsx(
                  'w-5 h-5 flex-shrink-0',
                  isActive(item.href) ? 'text-gray-900' : 'text-gray-400'
                )} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>

          {filteredAdminNav.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      Admin
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-1">
                {filteredAdminNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                      isActive(item.href)
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className={clsx(
                      'w-5 h-5 flex-shrink-0',
                      isActive(item.href) ? 'text-gray-900' : 'text-gray-400'
                    )} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          <div className={clsx(
            'flex items-center gap-3 p-2 rounded-lg bg-gray-50',
            collapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-gray-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                     user?.role === 'AGENCY_ADMIN' ? 'Admin' : 'Employee'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 
                     shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </motion.aside>
    </>
  );
}
