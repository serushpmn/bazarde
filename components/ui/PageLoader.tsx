import React from 'react';

export const PageLoader: React.FC = () => (
  <div
    className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-3 bg-canvas dark:bg-[#0f141c]"
    role="status"
    aria-live="polite"
    aria-label="در حال بارگذاری"
  >
    <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
    <p className="text-xs text-text-secondary dark:text-gray-400">در حال بارگذاری...</p>
  </div>
);

export default PageLoader;
