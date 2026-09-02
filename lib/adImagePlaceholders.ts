const CATEGORY_GRADIENTS: Record<string, string> = {
  'real-estate': 'from-sky-500 via-blue-600 to-indigo-700',
  vehicles: 'from-slate-500 via-gray-600 to-zinc-700',
  digital: 'from-violet-500 via-purple-600 to-fuchsia-700',
  'home-appliances': 'from-amber-500 via-orange-600 to-rose-600',
  services: 'from-teal-500 via-emerald-600 to-green-700',
  jobs: 'from-cyan-500 via-blue-600 to-indigo-700',
  'personal-goods': 'from-pink-500 via-rose-600 to-red-600',
  leisure: 'from-lime-500 via-green-600 to-emerald-700'
};

const FALLBACK_GRADIENTS = [
  'from-rose-500 via-red-600 to-rose-700',
  'from-orange-500 via-amber-600 to-yellow-600',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-indigo-500 via-blue-600 to-violet-700',
  'from-fuchsia-500 via-pink-600 to-rose-600',
  'from-slate-500 via-gray-600 to-zinc-700'
];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const hasValidAdImage = (images?: string[] | null): boolean => {
  return Boolean(images?.some((image) => image && image.trim().length > 0));
};

export const getPrimaryAdImage = (images?: string[] | null): string | null => {
  if (!hasValidAdImage(images)) return null;
  return images!.find((image) => image && image.trim().length > 0) || null;
};

export const getAdPlaceholderGradient = (categoryId?: string, seed?: string): string => {
  if (categoryId && CATEGORY_GRADIENTS[categoryId]) {
    return CATEGORY_GRADIENTS[categoryId];
  }

  const fallbackIndex = hashString(seed || categoryId || 'default') % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[fallbackIndex];
};

export const getCategoryIconName = (categoryId?: string): string => {
  const iconMap: Record<string, string> = {
    'real-estate': 'Home',
    vehicles: 'Car',
    digital: 'Smartphone',
    'home-appliances': 'Sofa',
    services: 'Wrench',
    jobs: 'Briefcase',
    'personal-goods': 'Shirt',
    leisure: 'Gamepad2'
  };

  return iconMap[categoryId || ''] || 'Layers';
};
