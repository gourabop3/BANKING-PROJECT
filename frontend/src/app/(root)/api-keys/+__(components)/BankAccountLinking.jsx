"use client";
import React, { useState, useEffect } from 'react';
import { FaUniversity, FaCheckCircle, FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { axiosClient } from '@/utils/AxiosClient';

const BankAccountLinking = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [formData, setFormData] = useState({
    account_number: '',
    routing_number: '',
    account_holder_name: '',
    bank_name: '',
    account_type: 'savings'
  });

  const [verificationData, setVerificationData] = useState({
    verification_code: '',
    account_id: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get('/payment-gateway/bank-accounts', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.post('/payment-gateway/bank-account/link', formData, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      toast.success(response.data.message);
      setShowAddForm(false);
      setFormData({
        account_number: '',
        routing_number: '',
        account_holder_name: '',
        bank_name: '',
        account_type: 'savings'
      });
      fetchBankAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to link bank account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.post('/payment-gateway/bank-account/verify', verificationData, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      toast.success(response.data.message);
      setShowVerifyForm(false);
      setVerificationData({ verification_code: '', account_id: '' });
      fetchBankAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to verify bank account');
    } finally {
      setSubmitting(false);
    }
  };

  const openVerifyForm = (account) => {
    setSelectedAccount(account);
    setVerificationData({ ...verificationData, account_id: account._id });
    setShowVerifyForm(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-600 text-2xl mr-3" />
          <span className="text-gray-600">Loading bank accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <FaUniversity className="text-blue-600" />
          Bank Account Management
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Bank Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <FaUniversity className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No bank accounts linked yet</p>
          <p className="text-sm text-gray-500">
            Link your bank account to start accepting payments through the gateway
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account._id}
              className={`border rounded-xl p-4 ${
                account.is_verified 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    account.is_verified ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {account.is_verified ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <FaExclamationTriangle className="text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {account.bank_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {account.account_holder_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ***{account.account_number.slice(-4)} ({account.account_type})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    account.is_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {account.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                  {!account.is_verified && (
                    <button
                      onClick={() => openVerifyForm(account)}
                      className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add Bank Account</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number / IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.routing_number}
                  onChange={(e) => setFormData({...formData, routing_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="checking">Checking</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Linking...
                    </div>
                  ) : (
                    'Link Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Account Modal */}
      {showVerifyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Verify Bank Account</h3>
              <button
                onClick={() => setShowVerifyForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Account:</strong> {selectedAccount?.bank_name}<br />
                <strong>Account Number:</strong> ***{selectedAccount?.account_number.slice(-4)}
              </p>
            </div>

            <form onSubmit={handleVerifyAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationData.verification_code}
                  onChange={(e) => setVerificationData({...verificationData, verification_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter verification code"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Check your email or SMS for the verification code
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVerifyForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountLinking;