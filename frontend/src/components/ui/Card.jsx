import React from 'react';
import clsx from 'clsx';

/**
 * Simple card with shadow, rounded corners and optional hover-lift.
 * Windows 7 Firefox compatible version without framer-motion.
 * Usage: <Card hover className="p-6"> … </Card>
 */
export default function Card({ children, className = '', hover = true, ...rest }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out',
        hover && 'hover:shadow-md hover:transform hover:scale-[1.02] hover:-translate-y-1',
        className
      )}
      style={{
        // Fallback styles for older browsers
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        WebkitBorderRadius: '12px',
        MozBorderRadius: '12px',
        WebkitBoxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        MozBoxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        WebkitTransition: 'all 0.3s ease-in-out',
        MozTransition: 'all 0.3s ease-in-out',
        OTransition: 'all 0.3s ease-in-out',
        transition: 'all 0.3s ease-in-out'
      }}
      {...rest}
    >
      {children}
    </div>
  );
}