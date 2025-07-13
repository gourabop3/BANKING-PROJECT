import React from 'react';
import clsx from 'clsx';

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded focus:outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none';
const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};
const variants = {
  primary: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-2 focus:ring-rose-500',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-2 focus:ring-gray-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-800',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  ...rest
}) {
  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}