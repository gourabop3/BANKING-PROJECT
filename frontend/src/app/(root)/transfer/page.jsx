"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import HeaderName from '@/components/HeaderName';
import { axiosClient } from '@/utils/AxiosClient';
import { useMainContext } from '@/context/MainContext';
import { generateAccountNumber, formatAccountNumber } from '@/utils/accountUtils';
import { FaExchangeAlt, FaUserCheck, FaCheckCircle } from 'react-icons/fa';
import { BiMoney } from 'react-icons/bi';

const TransferPage = () => {
  const [transferData, setTransferData] = useState({
    recipientAccountNumber: '',
    amount: '',
    remark: '',
    transferType: 'IMPS' // NEFT, RTGS, IMPS
  });
  const [loading, setLoading] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user, fetchUserProfile } = useMainContext();
  const router = useRouter();

  // Get user's account information
  const primaryAccount = user?.account_no?.[0];
  const userAccountNumber = (primaryAccount && user?._id) ? generateAccountNumber(user._id, primaryAccount._id, primaryAccount.ac_type) : '';
  const userBalance = primaryAccount?.amount || 0;

  // Real-time balance updates
  useEffect(() => {
    // Refresh user data every 15 seconds for real-time balance updates
    const interval = setInterval(() => {
      // Use fetchUserProfile from context for smooth updates
      fetchUserProfile();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset recipient details when account number changes
    if (name === 'recipientAccountNumber') {
      setRecipientDetails(null);
    }
  };

  const verifyRecipientAccount = async () => {
    if (!transferData.recipientAccountNumber || transferData.recipientAccountNumber.length < 12) {
      toast.error('Please enter a valid account number');
      return;
    }

    if (transferData.recipientAccountNumber === userAccountNumber) {
      toast.error('Cannot transfer to your own account');
      return;
    }

    setVerifyingAccount(true);
    try {
      const response = await axiosClient.post('/transfer/verify-account', {
        accountNumber: transferData.recipientAccountNumber
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (response.data.success) {
        setRecipientDetails(response.data.accountDetails);
        toast.success('Account verified successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Failed to verify account');
      setRecipientDetails(null);
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!recipientDetails) {
      toast.error('Please verify recipient account first');
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (amount < 1) {
      toast.error('Minimum transfer amount is ₹1');
      return;
    }

    if (transferData.transferType === 'RTGS' && amount < 200000) {
      toast.error('RTGS minimum amount is ₹2,00,000');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmTransfer = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/transfer/initiate', {
        ...transferData,
        amount: parseFloat(transferData.amount),
        recipientAccountId: recipientDetails.accountId
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (response.data.success) {
        const { transferId, transactionDetails } = response.data;
        
        // Immediately refresh balance after successful transfer
        await fetchUserProfile();
        
        // Show success message briefly before redirecting
        toast.success('Transfer successful! Balance updated.');
        
        setTimeout(() => {
          router.push(`/transfer-success?txnId=${transferId}&amount=${transactionDetails.amount}&recipient=${recipientDetails.accountHolderName}&account=${transferData.recipientAccountNumber}&type=${transferData.transferType}&ts=${Date.now()}`);
        }, 1500);
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <HeaderName />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <FaExchangeAlt className="text-white text-2xl" />
              <h1 className="text-2xl font-bold text-white">Money Transfer</h1>
            </div>
          </div>

          {/* User Account Info */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">From Account</p>
                <p className="font-mono font-semibold">
                  {userAccountNumber ? formatAccountNumber(userAccountNumber) : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Holder</p>
                <p className="font-semibold">{user?.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="font-semibold text-green-600">₹{userBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleTransfer} className="space-y-6">
              {/* Recipient Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Account Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="recipientAccountNumber"
                    value={transferData.recipientAccountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit account number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="12"
                    pattern="[0-9]{12}"
                  />
                  <button
                    type="button"
                    onClick={verifyRecipientAccount}
                    disabled={verifyingAccount || transferData.recipientAccountNumber.length < 12}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <FaUserCheck />
                    {verifyingAccount ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              {/* Recipient Details */}
              {recipientDetails && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="text-green-600" />
                    <span className="font-semibold text-green-800">Account Verified</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Account Holder</p>
                      <p className="font-semibold">{recipientDetails.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Type</p>
                      <p className="font-semibold">{recipientDetails.accountType}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Type
                  </label>
                  <select
                    name="transferType"
                    value={transferData.transferType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IMPS">IMPS (Instant)</option>
                    <option value="NEFT">NEFT (2-4 hours)</option>
                    <option value="RTGS">RTGS (Min ₹2,00,000)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={transferData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    min="1"
                    max={userBalance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark (Optional)
                </label>
                <input
                  type="text"
                  name="remark"
                  value={transferData.remark}
                  onChange={handleInputChange}
                  placeholder="Transfer purpose"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="100"
                />
              </div>

              <button
                type="submit"
                disabled={!recipientDetails || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold"
              >
                <BiMoney className="text-xl" />
                Transfer Money
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Transfer</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-semibold">{recipientDetails?.accountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-mono">{formatAccountNumber(transferData.recipientAccountNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">₹{parseFloat(transferData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span>{transferData.transferType}</span>
              </div>
              {transferData.remark && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Remark:</span>
                  <span>{transferData.remark}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPage;