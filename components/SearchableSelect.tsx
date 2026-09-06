import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  keywords?: string;
}

interface Props {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyOptionLabel?: string;
  searchPlaceholder?: string;
  className?: string;
}

/** Combobox-style select with type-to-filter (RTL-friendly). */
export const SearchableSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = 'انتخاب کنید...',
  emptyLabel = 'موردی یافت نشد',
  disabled = false,
  allowEmpty = false,
  emptyOptionLabel = '—',
  searchPlaceholder = 'جستجو...',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => {
      const hay = `${o.label} ${o.value} ${o.keywords || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className="w-full p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2 text-right"
      >
        <span className={`truncate ${selected || (allowEmpty && !value) ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
          {selected?.label || (allowEmpty && !value ? emptyOptionLabel : placeholder)}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1.5 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pr-9 pl-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs outline-none focus:border-primary"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {allowEmpty && (
              <li>
                <button
                  type="button"
                  onClick={() => pick('')}
                  className={`w-full text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !value ? 'text-primary font-bold bg-primary/5' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {emptyOptionLabel}
                </button>
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-[11px] text-gray-400">{emptyLabel}</li>
            ) : (
              filtered.map(o => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => pick(o.value)}
                    className={`w-full text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      value === o.value
                        ? 'text-primary font-bold bg-primary/5'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
