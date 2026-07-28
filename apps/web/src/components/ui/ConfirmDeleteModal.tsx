'use client';

import React, { useEffect } from 'react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Do you want to delete?',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Yes, Delete',
  cancelText = 'No, Cancel',
  isLoading = false,
  loadingText
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div 
        className={`bg-[#141413] border ${isLoading ? 'border-rose-500/40 shadow-rose-900/20' : 'border-white/10'} w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden font-sans transition-all`}
        role="dialog"
        aria-modal="true"
        aria-busy={isLoading}
      >
        {/* Modal Header */}
        <div className="bg-[#1b1a18] px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin text-rose-300' : ''}`}>
              {isLoading ? 'progress_activity' : 'warning'}
            </span>
          </div>
          <div>
            <h3 className="font-serif text-base text-white font-bold tracking-wide">{title}</h3>
            <p className="text-[10px] text-[#A69984]/65 font-semibold">
              {isLoading ? 'Processing Deletion...' : 'Confirmation Required'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#e5e2e1]/90 font-medium leading-relaxed">
            {description}
          </p>

          {/* Active Loading Banner */}
          {isLoading && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-[#ffc53d] animate-spin text-lg shrink-0">
                progress_activity
              </span>
              <span className="text-xs text-rose-200 font-semibold leading-tight">
                {loadingText || 'Deleting business tenant & cleaning database records, please wait...'}
              </span>
            </div>
          )}

          {/* Action Buttons: Yes / No */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              {isLoading ? 'Deleting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
