"use client";
import React, { useState } from 'react';
import { FaBank, FaPlus, FaArrowRight } from 'react-icons/fa';
import BankAccountLinking from './BankAccountLinking';

const SimpleBankAccountSection = () => {
  const [showFullManager, setShowFullManager] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
        <div className="text-center py-8">
          <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bank Account Section Temporarily Unavailable</h3>
          <p className="text-gray-600 text-sm mb-4">Please try refreshing the page or come back later.</p>
          <button
            onClick={() => setHasError(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showFullManager) {
    try {
      return <BankAccountLinking />;
    } catch (error) {
      console.error('BankAccountLinking error:', error);
      setHasError(true);
      return null;
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <FaBank className="text-blue-600" />
          Bank Account Setup
        </h3>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-blue-900 mb-2">
              Link Your Bank Account
            </h4>
            <p className="text-blue-700 text-sm mb-4">
              Connect your bank account to start accepting payments through the gateway. This enables real money transactions when customers pay through your integrated sites.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800">Secure account linking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800">Real-time settlements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800">Multiple account support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800">Verification process</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowFullManager(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <FaPlus className="text-sm" />
              Manage Bank Accounts
            </button>
            
            <div className="text-center">
              <span className="text-xs text-blue-600 flex items-center gap-1">
                Click to add & verify accounts
                <FaArrowRight className="text-xs" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">1</div>
          <div className="text-sm text-gray-600">Add Account Details</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">2</div>
          <div className="text-sm text-gray-600">Verify with Code</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">3</div>
          <div className="text-sm text-gray-600">Start Accepting Payments</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBankAccountSection;