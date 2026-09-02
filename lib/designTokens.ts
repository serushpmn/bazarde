/** Centralized design token class helpers */

export const container = 'max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8';

export const card = 'bg-surface dark:bg-gray-900 rounded-2xl border border-border dark:border-gray-800 shadow-card';

export const cardHover =
  'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 text-text-primary dark:text-gray-200 font-medium text-sm transition-all duration-200 hover:bg-canvas dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-text-secondary dark:text-gray-400 font-medium text-sm transition-colors duration-200 hover:bg-canvas dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export const inputBase =
  'w-full px-4 py-3 bg-canvas dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl text-sm text-text-primary dark:text-white placeholder:text-text-muted outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10';

export const labelSm = 'block text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2';

export const heading1 = 'text-2xl sm:text-[28px] font-bold text-text-primary dark:text-white leading-snug';

export const heading2 = 'text-xl sm:text-[22px] font-bold text-text-primary dark:text-white leading-snug';

export const heading3 = 'text-lg sm:text-lg font-semibold text-text-primary dark:text-white leading-snug';

export const bodyText = 'text-sm text-text-primary dark:text-gray-300 leading-relaxed';

export const caption = 'text-xs text-text-secondary dark:text-gray-400 leading-normal';

export const priceLg = 'text-2xl sm:text-[28px] font-bold text-text-primary dark:text-white dir-ltr font-mono';

export const priceMd = 'text-base font-bold text-text-primary dark:text-white dir-ltr font-mono';

export const metaRow = 'flex flex-wrap items-center gap-3 text-xs text-text-secondary dark:text-gray-400';
