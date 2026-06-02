import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500';

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm hover:shadow-md',
    secondary: 'bg-surface-raised text-ink-700 border border-brand-200 hover:bg-brand-50 active:bg-brand-100',
    ghost: 'text-brand-600 hover:bg-brand-50 active:bg-brand-100',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm hover:shadow-md',
    warn: 'bg-warn-500 text-white hover:bg-warn-600 active:bg-warn-700 shadow-sm hover:shadow-md',
    success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-sm hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
