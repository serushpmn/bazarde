import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="bg-surface dark:bg-gray-900 rounded-2xl p-12 text-center border border-border dark:border-gray-800 shadow-card space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-primary-light dark:bg-red-950/30 text-primary flex items-center justify-center mx-auto">
      <Icon className="w-7 h-7" strokeWidth={1.75} />
    </div>
    <div>
      <h3 className="font-bold text-lg text-text-primary dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
