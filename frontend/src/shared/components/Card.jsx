import React from 'react';

const Card = React.forwardRef(({
  children,
  className = '',
  padding = true,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-surface-raised rounded-lg border border-brand-200
        shadow-sm hover:shadow-md transition-shadow duration-200
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
