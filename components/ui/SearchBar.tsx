import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { inputBase } from '../../lib/designTokens';

interface SearchBarProps {
  compact?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  compact = false,
  className = '',
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQ = params.get('q') || '';

  const [query, setQuery] = useState(initialQ);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setQuery(q);
  }, [location.search]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const next = new URLSearchParams(location.search);
    const trimmed = query.trim();
    if (trimmed) next.set('q', trimmed);
    else next.delete('q');
    const search = next.toString();
    navigate(search ? `/?${search}` : '/');
  };

  const clear = () => {
    setQuery('');
    const next = new URLSearchParams(location.search);
    next.delete('q');
    const search = next.toString();
    navigate(search ? `/?${search}` : '/');
  };

  return (
    <form
      onSubmit={submit}
      className={`relative flex items-center gap-2 ${className}`}
      role="search"
    >
      <div className="relative flex-1">
        <Search
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در آگهی‌ها، خدمات و محصولات..."
          autoFocus={autoFocus}
          aria-label="جستجو در آگهی‌ها"
          className={`${inputBase} ${compact ? 'h-11 py-2.5 text-xs' : 'h-14 text-sm'} pr-12 pl-10`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
            aria-label="پاک کردن جستجو"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {!compact && (
        <button type="submit" className="hidden sm:flex h-14 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm items-center gap-2 transition-colors duration-200 shrink-0">
          <Search className="w-4 h-4" />
          <span>جستجو</span>
        </button>
      )}
    </form>
  );
};

export default SearchBar;
