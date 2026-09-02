import React from 'react';
import { btnPrimary, btnSecondary, btnGhost } from '../../lib/designTokens';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  asChild?: false;
}

const variantClass: Record<Variant, string> = {
  primary: btnPrimary,
  secondary: btnSecondary,
  ghost: btnGhost,
};

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg',
  md: 'px-5 py-3 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-sm rounded-xl h-14',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  children,
  ...props
}) => {
  const base = variantClass[variant];
  const sized = size === 'md' ? base : `${base} ${sizeClass[size]}`;

  return (
    <button
      type="button"
      className={`${sized} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
