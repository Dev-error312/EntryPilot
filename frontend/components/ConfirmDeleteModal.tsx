'use client';

import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  description: string;
  itemName: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  itemName,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 mb-2">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">"{itemName}"</span>?
                </p>
                <p className="text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-lg">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
