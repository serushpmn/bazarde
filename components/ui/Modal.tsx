import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  mobileDrawer?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  mobileDrawer = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size];

  const drawerClasses = mobileDrawer
    ? 'fixed inset-x-0 bottom-0 sm:relative sm:inset-auto rounded-t-2xl sm:rounded-2xl max-h-[90vh] sm:max-h-none'
    : 'rounded-2xl';

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${mobileDrawer ? 'flex-col justify-end sm:items-center sm:justify-center' : 'items-center justify-center'} p-0 sm:p-4 bg-black/50 backdrop-blur-sm`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-surface dark:bg-gray-900 w-full ${widthClass} ${drawerClasses} shadow-xl border border-border dark:border-gray-800 overflow-hidden flex flex-col animate-modal-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-5 py-4 border-b border-border dark:border-gray-800 flex items-center justify-between shrink-0">
            <h2 id="modal-title" className="font-bold text-sm text-text-primary dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-canvas dark:hover:bg-gray-800 transition-colors"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-border dark:border-gray-800 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
