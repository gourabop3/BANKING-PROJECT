'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import HeaderName from '@/components/HeaderName';
import { MdCheckCircle } from 'react-icons/md';

const RechargeSuccessPage = () => {
  const searchParams = useSearchParams();
  const txnId = searchParams.get('txnId');
  const mobile = searchParams.get('mobile');
  const amount = searchParams.get('amount');
  const operator = searchParams.get('operator');
  const dateTime = new Date(Number(searchParams.get('ts') || Date.now())).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return (
    <div className="container py-10 min-h-screen flex flex-col">
      <HeaderName />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <MdCheckCircle className="text-green-600" size={64} />
            <h1 className="text-2xl font-bold mt-2 text-green-700">Recharge Successful</h1>
            <p className="text-gray-500">Your mobile recharge has been processed.</p>
          </div>

          <div className="border rounded-lg divide-y">
            <Detail label="Transaction ID" value={txnId} mono />
            <Detail label="Date & Time" value={dateTime} />
            <Detail label="Mobile Number" value={mobile} />
            <Detail label="Operator" value={operator} />
            <Detail label="Amount" value={`₹${Number(amount).toLocaleString()}`} highlight />
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, mono, highlight }) => (
  <div className="grid grid-cols-3 py-3 px-4 text-sm">
    <span className="font-medium text-gray-600 col-span-1">{label}</span>
    <span className={`col-span-2 text-right ${mono ? 'font-mono' : ''} ${highlight ? 'text-green-700 font-semibold' : ''}`}>{value}</span>
  </div>
);

export default RechargeSuccessPage;