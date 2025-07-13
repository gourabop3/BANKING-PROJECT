import React from 'react';
import clsx from 'clsx';

export default function Input({ className = '', error, ...rest }) {
  return (
    <input
      className={clsx(
        'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-500',
        error && 'border-red-500',
        className
      )}
      {...rest}
    />
  );
}