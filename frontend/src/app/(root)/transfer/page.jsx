"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import HeaderName from '@/components/HeaderName';
import { axiosClient } from '@/utils/AxiosClient';
import { useMainContext } from '@/context/MainContext';
import { generateAccountNumber, formatAccountNumber } from '@/utils/accountUtils';
import { 
  FaExchangeAlt, 
  FaUserCheck, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaBank, 
  FaCreditCard,
  FaMobile,
  FaGlobe,
  FaSearch,
  FaSpinner,
  FaInfoCircle,
  FaClock,
  FaMoneyBillWave,
  FaHandshake,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { 
  BiMoney, 
  BiTransfer, 
  BiUser, 
  BiBuildingHouse,
  BiTime,
  BiCheckShield
} from 'react-icons/bi';
import { 
  MdAccountBalance, 
  MdVerified, 
  MdSecurity, 
  MdSpeed, 
  MdPayment,
  MdReceipt,
  MdAccountCircle,
  MdBusiness,
  MdHome,
  MdSchool,
  MdLocalHospital,
  MdShoppingCart,
  MdRestaurant,
  MdDirectionsCar,
  MdFlight,
  MdHotel,
  MdCheckCircle
} from 'react-icons/md';
import { IoShieldCheckmark, IoCardOutline } from 'react-icons/io5';

const TransferPage = () => {
  // Remove external bank transfer mode and related logic
  // Only allow internal transfers
  const [transferMode, setTransferMode] = useState('internal'); // 'internal' only
  const [transferData, setTransferData] = useState({
    recipientAccountNumber: '',
    recipientName: '',
    ifscCode: '',
    bankName: '',
    amount: '',
    remark: '',
    transferType: 'IMPS', // NEFT, RTGS, IMPS
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [balanceAnimation, setBalanceAnimation] = useState(false);
  const { user, fetchUserProfile } = useMainContext();
  const router = useRouter();

  useEffect(() => {
    if (user && user.kyc_status !== 'completed') {
      router.replace('/customer-service');
    }
  }, [user, router]);

  // KYC check and custom message (do NOT redirect)
  const showKycBlock = user && user.kyc_status !== 'completed';

  if (showKycBlock) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">KYC Required</h2>
          <p className="text-gray-700 mb-4">You must complete your KYC to access this section.</p>
          <button
            onClick={() => router.replace('/customer-service')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Customer Service
          </button>
        </div>
      </div>
    );
  }

  // Add UPI transfer tab/section
  const [activeTab, setActiveTab] = useState('internal'); // 'internal' or 'upi'
  const [upiData, setUpiData] = useState({ upiId: '', amount: '', pin: '' });
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [upiLoading, setUpiLoading] = useState(false);

  // UPI handlers
  const handleUpiInputChange = (e) => {
    const { name, value } = e.target;
    setUpiData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpiProceed = (e) => {
    e.preventDefault();
    if (!upiData.upiId || !upiData.amount || isNaN(parseFloat(upiData.amount)) || parseFloat(upiData.amount) <= 0) {
      toast.error('Enter valid UPI ID and amount');
      return;
    }
    setShowUpiPin(true);
  };

  const handleUpiPinSubmit = async (e) => {
    e.preventDefault();
    setUpiLoading(true);
    // Mock PIN check: accept 1234 as correct
    setTimeout(() => {
      setUpiLoading(false);
      if (upiData.pin === '1234') {
        toast.success('UPI Transfer Successful!');
        setUpiData({ upiId: '', amount: '', pin: '' });
        setShowUpiPin(false);
        fetchUserProfile();
      } else {
        toast.error('Incorrect UPI PIN');
      }
    }, 1000);
  };

  // Get user's account information
  const primaryAccount = user?.account_no?.[0];
  const userAccountNumber = (primaryAccount && user?._id) ? generateAccountNumber(user._id, primaryAccount._id, primaryAccount.ac_type) : '';
  const userBalance = primaryAccount?.amount || 0;

  // Real-time balance updates with animation
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserProfile();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchUserProfile]);

  // Remove external bank transfer mode and related logic
  // Remove the transfer mode toggle and any references to 'external'

  // Transfer purposes
  const transferPurposes = [
    { id: 'salary', name: 'Salary', icon: MdBusiness },
    { id: 'rent', name: 'Rent', icon: MdHome },
    { id: 'education', name: 'Education', icon: MdSchool },
    { id: 'medical', name: 'Medical', icon: MdLocalHospital },
    { id: 'shopping', name: 'Shopping', icon: MdShoppingCart },
    { id: 'food', name: 'Food & Dining', icon: MdRestaurant },
    { id: 'transport', name: 'Transport', icon: MdDirectionsCar },
    { id: 'travel', name: 'Travel', icon: MdFlight },
    { id: 'hotel', name: 'Hotel', icon: MdHotel },
    { id: 'other', name: 'Other', icon: MdReceipt }
  ];

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

  const handleBankSelect = (bank) => {
    setTransferData(prev => ({
      ...prev,
      ifscCode: bank.code,
      bankName: bank.name
    }));
  };

  const handlePurposeSelect = (purpose) => {
    setTransferData(prev => ({
      ...prev,
      purpose: purpose.id
    }));
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
      const endpoint = '/transfer/verify-account';
      const payload = {
        accountNumber: transferData.recipientAccountNumber
      };

      const response = await axiosClient.post(endpoint, payload, {
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
    console.log("confirmTransfer called", transferMode, transferData, recipientDetails);
    setLoading(true);
    try {
      const endpoint = '/transfer/initiate';
      const payload = {
        ...transferData,
        amount: parseFloat(transferData.amount),
        recipientAccountId: recipientDetails?.accountId || ''
      };
      console.log("About to send transfer request", endpoint, payload);

      const response = await axiosClient.post(endpoint, payload, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (response.data && response.data.success) {
        const { transferId, transactionDetails } = response.data;
        setBalanceAnimation(true);
        setTimeout(() => setBalanceAnimation(false), 2000);
        await fetchUserProfile();
        toast.success('Transfer successful! Balance updated.');
        setTimeout(() => {
          const params = new URLSearchParams({
            txnId: transferId || '',
            amount: transferData.amount || '',
            recipient: recipientDetails?.accountHolderName || '',
            account: transferData.recipientAccountNumber || '',
            type: transferData.transferType || '',
            mode: transferMode || '',
            ts: Date.now()
          });
          router.push(`/transfer-success?${params.toString()}`);
        }, 1500);
      } else {
        toast.error(response.data?.msg || 'Transfer failed');
      }
    } catch (error) {
      console.log('Transfer error:', error);
      let msg = 'Transfer failed';
      if (error?.response?.data?.msg) {
        msg = error.response.data.msg;
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Defensive rendering for recipientDetails
  const safeRecipientName = recipientDetails?.accountHolderName || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container py-6 md:py-10 px-4 md:px-6">
        <HeaderName />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <FaExchangeAlt className="text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Money Transfer</h1>
                <p className="text-blue-100">Transfer money to any bank account instantly</p>
              </div>
            </div>
            
            {/* Transfer Mode Toggle */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Transfer Type:</span>
                <div className="flex bg-white/20 rounded-lg p-1">
                  <button
                    onClick={() => setTransferMode('internal')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      transferMode === 'internal' 
                        ? 'bg-white text-blue-600 shadow-lg' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Internal
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-200">
                {transferMode === 'internal' ? 'Transfer within our bank' : 'Transfer to any bank account'}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Account Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MdAccountBalance className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">From Account</p>
                  <p className="font-mono font-semibold text-gray-800">
                    {userAccountNumber ? formatAccountNumber(userAccountNumber) : 'Loading...'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <MdVerified className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Holder</p>
                  <p className="font-semibold text-gray-800">{user?.name || 'Loading...'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <BiMoney className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className={`font-semibold text-lg transition-all duration-500 ${
                    balanceAnimation ? 'text-green-600 scale-110' : 'text-green-600'
                  }`}>
                    ₹{userBalance.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <MdSecurity className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transfer Mode</p>
                  <p className="font-semibold text-gray-800 capitalize">{transferMode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <form onSubmit={handleTransfer} className="space-y-8">
                {/* Transfer Mode Specific Fields */}
                {transferMode === 'internal' ? (
                  /* Internal Transfer Form */
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Recipient Account Number
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          name="recipientAccountNumber"
                          value={transferData.recipientAccountNumber}
                          onChange={handleInputChange}
                          placeholder="Enter 12-digit account number"
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          maxLength="12"
                          pattern="[0-9]{12}"
                        />
                        <button
                          type="button"
                          onClick={verifyRecipientAccount}
                          disabled={verifyingAccount || transferData.recipientAccountNumber.length < 12}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                        >
                          {verifyingAccount ? <FaSpinner className="animate-spin" /> : <FaUserCheck />}
                          {verifyingAccount ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* External Bank Transfer Form */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Recipient Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="recipientName"
                            value={transferData.recipientName}
                            onChange={handleInputChange}
                            placeholder="Enter recipient's full name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <BiUser className="text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Account Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="recipientAccountNumber"
                            value={transferData.recipientAccountNumber}
                            onChange={handleInputChange}
                            placeholder="Enter account number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <FaCreditCard className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          IFSC Code
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="ifscCode"
                            value={transferData.ifscCode}
                            onChange={handleInputChange}
                            placeholder="Enter IFSC code"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
                            maxLength="11"
                            required
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <FaBank className="text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Bank Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="bankName"
                            value={transferData.bankName}
                            onChange={handleInputChange}
                            placeholder="Enter bank name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <BiBuildingHouse className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Popular Banks Quick Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Quick Select Popular Banks
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* This section is no longer relevant for external transfers */}
                        {/* {popularBanks.map((bank) => (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => handleBankSelect(bank)}
                            className={`p-3 border-2 rounded-xl text-center transition-all duration-200 hover:shadow-md ${
                              transferData.ifscCode === bank.code
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{bank.logo}</div>
                            <div className="text-xs font-medium text-gray-700">{bank.name}</div>
                          </button>
                        ))} */}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={verifyRecipientAccount}
                        disabled={verifyingAccount || !transferData.recipientName || !transferData.recipientAccountNumber || !transferData.ifscCode}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        {verifyingAccount ? <FaSpinner className="animate-spin" /> : <FaUserCheck />}
                        {verifyingAccount ? 'Verifying...' : 'Verify Account'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Recipient Details Display */}
                {recipientDetails && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FaCheckCircle className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-800">Account Verified Successfully</h3>
                        <p className="text-sm text-green-600">Proceed with the transfer</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Account Holder</p>
                        <p className="font-semibold text-gray-800">
                          {safeRecipientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-mono font-semibold text-gray-800">
                          {formatAccountNumber(transferData.recipientAccountNumber)}
                        </p>
                      </div>
                      {/* {transferMode === 'external' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Bank Name</p>
                            <p className="font-semibold text-gray-800">{transferData.bankName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">IFSC Code</p>
                            <p className="font-mono font-semibold text-gray-800">{transferData.ifscCode}</p>
                          </div>
                        </>
                      )} */}
                    </div>
                  </div>
                )}

                {/* Transfer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Transfer Type
                    </label>
                    <div className="relative">
                      <select
                        name="transferType"
                        value={transferData.transferType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                      >
                        <option value="IMPS">IMPS (Instant Transfer)</option>
                        <option value="NEFT">NEFT (2-4 hours)</option>
                        <option value="RTGS">RTGS (Min ₹2,00,000)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <BiTime className="text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaInfoCircle />
                      <span>
                        {transferData.transferType === 'IMPS' && 'Instant transfer, available 24/7'}
                        {transferData.transferType === 'NEFT' && 'Settled in batches, 2-4 hours'}
                        {transferData.transferType === 'RTGS' && 'Real-time settlement, min ₹2L'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Amount (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="amount"
                        value={transferData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        min="1"
                        max={userBalance}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <BiMoney className="text-gray-400 text-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer Purpose */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Transfer Purpose (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {transferPurposes.map((purpose) => {
                      const IconComponent = purpose.icon;
                      return (
                        <button
                          key={purpose.id}
                          type="button"
                          onClick={() => handlePurposeSelect(purpose)}
                          className={`p-3 border-2 rounded-xl text-center transition-all duration-200 hover:shadow-md ${
                            transferData.purpose === purpose.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <IconComponent className="text-2xl mx-auto mb-1 text-gray-600" />
                          <div className="text-xs font-medium text-gray-700">{purpose.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Remark (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="remark"
                      value={transferData.remark}
                      onChange={handleInputChange}
                      placeholder="Add a note for this transfer"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      maxLength="100"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MdReceipt className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!recipientDetails || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <BiTransfer className="text-xl" />
                  {loading ? 'Processing...' : 'Transfer Money'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Enhanced Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <IoShieldCheckmark className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Confirm Transfer</h2>
                    <p className="text-blue-100 text-sm">
                      Internal transfer
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">To:</span>
                  <span className="font-semibold text-gray-800">
                    {safeRecipientName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-mono text-gray-800">
                    {formatAccountNumber(transferData.recipientAccountNumber)}
                  </span>
                </div>
                {/* {transferMode === 'external' && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-semibold text-gray-800">{transferData.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">IFSC:</span>
                      <span className="font-mono text-gray-800">{transferData.ifscCode}</span>
                    </div>
                  </>
                )} */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-lg text-green-600">₹{parseFloat(transferData.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold text-gray-800">{transferData.transferType}</span>
                </div>
                {transferData.remark && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Remark:</span>
                    <span className="text-gray-800">{transferData.remark}</span>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmTransfer}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <MdCheckCircle />}
                    {loading ? 'Processing...' : 'Confirm Transfer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferPage;