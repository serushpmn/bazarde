import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => (
  <nav
    aria-label="مسیر صفحه"
    className={`flex items-center flex-wrap gap-1 text-[13px] text-text-muted dark:text-gray-500 ${className}`}
  >
    {items.map((item, i) => {
      const isLast = i === items.length - 1;
      return (
        <React.Fragment key={`${item.label}-${i}`}>
          {i > 0 && (
            <ChevronLeft className="w-3.5 h-3.5 text-text-muted shrink-0 rotate-180" aria-hidden />
          )}
          {item.to && !isLast ? (
            <Link
              to={item.to}
              className="hover:text-primary transition-colors shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`${isLast ? 'text-text-primary dark:text-gray-200 font-medium truncate max-w-[200px] sm:max-w-none' : 'shrink-0'}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

export default Breadcrumbs;
