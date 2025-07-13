"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import HeaderName from '@/components/HeaderName';
import { axiosClient } from '@/utils/AxiosClient';
import { useMainContext } from '@/context/MainContext';
import { generateAccountNumber, formatAccountNumber } from '@/utils/accountUtils';
import { 
  MdPhoneAndroid, 
  MdElectricBolt, 
  MdWater, 
  MdLocalGasStation,
  MdCreditCard,
  MdWifi,
  MdTv,
  MdCheckCircle
} from 'react-icons/md';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { BiMoney } from 'react-icons/bi';

const RechargePage = () => {
  const [activeTab, setActiveTab] = useState('mobile');
  const [rechargeData, setRechargeData] = useState({
    mobileNumber: '',
    operator: '',
    amount: '',
    billType: '',
    consumerNumber: '',
    billAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [operatorDetails, setOperatorDetails] = useState(null);
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
      fetchUserProfile();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchUserProfile]);

  // Mobile operators with their details
  const mobileOperators = [
    { id: 'jio', name: 'Jio', logo: '🔵', color: '#0066cc' },
    { id: 'airtel', name: 'Airtel', logo: '🔴', color: '#dc2626' },
    { id: 'vi', name: 'Vi (Vodafone Idea)', logo: '🟣', color: '#7c3aed' },
    //add more 
  ];

  // Bill payment types
  const billTypes = [
    { id: 'electricity', name: 'Electricity Bill', icon: MdElectricBolt, color: '#eab308' },
    { id: 'water', name: 'Water Bill', icon: MdWater, color: '#0ea5e9' },
    { id: 'gas', name: 'Gas Bill', icon: MdLocalGasStation, color: '#f97316' },
    { id: 'credit_card', name: 'Credit Card', icon: MdCreditCard, color: '#dc2626' },
    { id: 'broadband', name: 'Broadband/Internet', icon: MdWifi, color: '#059669' },
    { id: 'dth', name: 'DTH/Cable TV', icon: MdTv, color: '#7c3aed' }
  ];

  // Popular recharge plans
  const popularPlans = {
    jio: [
      { amount: 149, validity: '24 days', data: '1GB/day', description: 'Unlimited calls + SMS' },
      { amount: 299, validity: '28 days', data: '2GB/day', description: 'Unlimited calls + SMS' },
      { amount: 399, validity: '56 days', data: '1.5GB/day', description: 'Unlimited calls + SMS' },
      { amount: 666, validity: '84 days', data: '1.5GB/day', description: 'Unlimited calls + SMS' },
      { amount: 999, validity: '84 days', data: '3GB/day', description: 'Unlimited calls + SMS' }
    ],
    airtel: [
      { amount: 155, validity: '24 days', data: '1GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 319, validity: '30 days', data: '2GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 479, validity: '56 days', data: '1.5GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 719, validity: '84 days', data: '1.5GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 1199, validity: '84 days', data: '3GB/day', description: 'Unlimited calls + 100 SMS' }
    ],
    vi: [
      { amount: 157, validity: '28 days', data: '1GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 327, validity: '28 days', data: '2GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 497, validity: '56 days', data: '1.5GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 747, validity: '84 days', data: '1.5GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 1247, validity: '84 days', data: '3GB/day', description: 'Unlimited calls + 100 SMS' }
    ],
    bsnl: [
      { amount: 107, validity: '35 days', data: '2GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 187, validity: '28 days', data: '2GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 397, validity: '80 days', data: '2GB/day', description: 'Unlimited calls + 100 SMS' },
      { amount: 797, validity: '160 days', data: '2GB/day', description: 'Unlimited calls + 100 SMS' }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRechargeData(prev => ({
      ...prev,
      [name]: value
    }));

    // Load plans when operator is selected
    if (name === 'operator' && value && popularPlans[value]) {
      setPlans(popularPlans[value]);
    }
  };

  const handlePlanSelect = (plan) => {
    setRechargeData(prev => ({
      ...prev,
      amount: plan.amount.toString()
    }));
  };

  const validateMobileNumber = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'mobile') {
      // Mobile recharge validation
      if (!validateMobileNumber(rechargeData.mobileNumber)) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
      
      if (!rechargeData.operator) {
        toast.error('Please select an operator');
        return;
      }
    } else {
      // Bill payment validation
      if (!rechargeData.billType) {
        toast.error('Please select bill type');
        return;
      }
      
      if (!rechargeData.consumerNumber) {
        toast.error('Please enter consumer/account number');
        return;
      }
    }

    const amount = parseFloat(activeTab === 'mobile' ? rechargeData.amount : rechargeData.billAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmRecharge = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'mobile' ? '/recharge/mobile' : '/recharge/bill-payment';
      const payload = activeTab === 'mobile' ? {
        mobileNumber: rechargeData.mobileNumber,
        operator: rechargeData.operator,
        amount: parseFloat(rechargeData.amount),
        rechargeType: 'mobile'
      } : {
        billType: rechargeData.billType,
        consumerNumber: rechargeData.consumerNumber,
        amount: parseFloat(rechargeData.billAmount),
        rechargeType: 'bill'
      };

      const response = await axiosClient.post(endpoint, payload, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (response.data.success) {
        // Immediately refresh balance after successful recharge/bill payment
        await fetchUserProfile();
        
        // Show success message briefly before redirecting
        toast.success(`${activeTab === 'mobile' ? 'Recharge' : 'Bill payment'} successful! Balance updated.`);
        
        setTimeout(() => {
          if (activeTab === 'mobile') {
            const { transactionId, details } = response.data;
            router.push(`/recharge-success?txnId=${transactionId}&mobile=${details?.mobileNumber || rechargeData.mobileNumber}&amount=${details?.amount || rechargeData.amount}&operator=${rechargeData.operator}&ts=${Date.now()}`);
          } else {
            // For bill payment, redirect with appropriate params
            const { transactionId } = response.data;
            router.push(`/recharge-success?txnId=${transactionId}&amount=${rechargeData.billAmount}&operator=${rechargeData.billType}&ts=${Date.now()}`);
          }
        }, 1500);
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || `${activeTab === 'mobile' ? 'Recharge' : 'Bill payment'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <HeaderName />
      
      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 px-6 py-4 text-center font-semibold flex items-center justify-center gap-2 ${
                activeTab === 'mobile' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MdPhoneAndroid className="text-xl" />
              Mobile Recharge
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`flex-1 px-6 py-4 text-center font-semibold flex items-center justify-center gap-2 ${
                activeTab === 'bills' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MdElectricBolt className="text-xl" />
              Bill Payments
            </button>
          </div>

          {/* User Account Info */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-mono font-semibold">{formatAccountNumber(userAccountNumber)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Holder</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="font-semibold text-green-600">₹{userBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'mobile' ? (
              /* Mobile Recharge Form */
              <form onSubmit={handleRecharge} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={rechargeData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength="10"
                      pattern="[6-9][0-9]{9}"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Operator
                    </label>
                    <select
                      name="operator"
                      value={rechargeData.operator}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose Operator</option>
                      {mobileOperators.map(op => (
                        <option key={op.id} value={op.id}>
                          {op.logo} {op.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Popular Plans */}
                {plans.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Popular Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plans.map((plan, index) => (
                        <div
                          key={index}
                          onClick={() => handlePlanSelect(plan)}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            rechargeData.amount === plan.amount.toString()
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xl font-bold text-blue-600">₹{plan.amount}</div>
                            {rechargeData.amount === plan.amount.toString() && (
                              <FaCheckCircle className="text-blue-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Validity:</strong> {plan.validity}</p>
                            <p><strong>Data:</strong> {plan.data}</p>
                            <p>{plan.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recharge Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={rechargeData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    min="10"
                    max={userBalance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold"
                >
                  <MdPhoneAndroid className="text-xl" />
                  Recharge Now
                </button>
              </form>
            ) : (
              /* Bill Payment Form */
              <form onSubmit={handleRecharge} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Bill Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {billTypes.map(bill => {
                      const IconComponent = bill.icon;
                      return (
                        <div
                          key={bill.id}
                          onClick={() => setRechargeData(prev => ({ ...prev, billType: bill.id }))}
                          className={`border rounded-lg p-4 cursor-pointer text-center transition-all hover:shadow-md ${
                            rechargeData.billType === bill.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <IconComponent 
                            className="text-3xl mx-auto mb-2" 
                            style={{ color: bill.color }} 
                          />
                          <p className="font-medium text-sm">{bill.name}</p>
                          {rechargeData.billType === bill.id && (
                            <FaCheckCircle className="text-blue-500 mx-auto mt-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consumer/Account Number
                    </label>
                    <input
                      type="text"
                      name="consumerNumber"
                      value={rechargeData.consumerNumber}
                      onChange={handleInputChange}
                      placeholder="Enter consumer number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="billAmount"
                      value={rechargeData.billAmount}
                      onChange={handleInputChange}
                      placeholder="Enter bill amount"
                      min="10"
                      max={userBalance}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold"
                >
                  <BiMoney className="text-xl" />
                  Pay Bill
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              Confirm {activeTab === 'mobile' ? 'Recharge' : 'Bill Payment'}
            </h2>
            <div className="space-y-3 mb-6">
              {activeTab === 'mobile' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mobile Number:</span>
                    <span className="font-semibold">{rechargeData.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operator:</span>
                    <span className="font-semibold">
                      {mobileOperators.find(op => op.id === rechargeData.operator)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-lg">₹{parseFloat(rechargeData.amount).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bill Type:</span>
                    <span className="font-semibold">
                      {billTypes.find(bill => bill.id === rechargeData.billType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consumer Number:</span>
                    <span className="font-semibold">{rechargeData.consumerNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-lg">₹{parseFloat(rechargeData.billAmount).toLocaleString()}</span>
                  </div>
                </>
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
                onClick={confirmRecharge}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <MdCheckCircle />}
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargePage;