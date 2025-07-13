import React from 'react';
import clsx from 'clsx';

export default function Table({ headers = [], children, className = '', ...rest }) {
  return (
    <div className="overflow-x-auto w-full">
      <table
        className={clsx('min-w-full text-sm text-left bg-white rounded-xl overflow-hidden', className)}
        {...rest}
      >
        {headers.length > 0 && (
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 [&>tr:nth-child(odd)]:bg-gray-50">
          {children}
        </tbody>
      </table>
    </div>
  );
}