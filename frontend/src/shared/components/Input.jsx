import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink-700 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-2.5 text-base border rounded-md
          transition-all duration-200
          text-ink-900 placeholder-ink-300
          border-brand-200 bg-surface-raised
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          ${error ? 'border-danger-500 focus:ring-danger-500' : ''}
          ${props.disabled ? 'bg-surface-sunken text-ink-500 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger-500 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-ink-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
