import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    neutral: 'bg-brand-100 text-brand-800 border border-brand-300',
    brand: 'bg-brand-600 text-white border border-brand-700',
    warn: 'bg-warn-50 text-warn-800 border border-warn-300',
    danger: 'bg-danger-50 text-danger-800 border border-danger-300',
    success: 'bg-success-50 text-success-700 border border-success-300',
    info: 'bg-info-50 text-info-800 border border-info-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-sm font-medium',
    lg: 'px-4 py-2 text-base font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
