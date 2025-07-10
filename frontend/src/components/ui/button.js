// src/components/ui/button.js
import React from 'react';
import clsx from 'clsx';

const Button = ({ children, type = 'button', onClick, variant = 'primary', className = '' }) => {
  const baseStyles =
    'px-4 py-2 rounded-xl text-sm font-medium transition duration-200 focus:outline-none';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(baseStyles, variants[variant], className)}
    >
      {children}
    </button>
  );
};

export default Button;
