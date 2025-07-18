"use client";
import React, { useState, useEffect } from 'react';
import HeaderName from '@/components/HeaderName';
import { MdSend, MdHistory, MdAccountBalance, MdPayment, MdRequest } from 'react-icons/md';
import { FaCopy, FaCheck, FaHandHoldingUsd } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';
import { useRouter } from 'next/navigation';

const UPIPage = () => {
  // Safe context usage with fallback
  let user, loading;
  try {
    const context = useMainContext();
    user = context?.user || null;
    loading = context?.loading || false;
  } catch (error) {
    console.error('Context error:', error);
    user = null;
    loading = false;
  }
  
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('pay');
  const [upiInfo, setUpiInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [upiLoading, setUpiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Payment form states
  const [paymentForm, setPaymentForm] = useState({
    recipient_upi: '',
    amount: '',
    note: '',
    pin: ''
  });

  // Money request form states
  const [requestForm, setRequestForm] = useState({
    from_upi: '',
    amount: '',
    note: ''
  });

  const [validationResult, setValidationResult] = useState(null);
  
  // Money request states
  const [requestStatus, setRequestStatus] = useState({ success: null, error: null });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestValidation, setRequestValidation] = useState(null);
  
  // Money requests viewing and management
  const [moneyRequests, setMoneyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  const [registrationForm, setRegistrationForm] = useState({
    upi_id: '',
    pin: '',
    confirm_pin: ''
  });

  // Local form validation state
  const [formValidation, setFormValidation] = useState({ upi_id: null, pin: null, confirm_pin: null });

  // Payment confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({ success: null, error: null });

  // Add state for two-step UPI pay flow
  const [paymentStep, setPaymentStep] = useState(1); // 1: form, 2: confirmation

  // Add states for reset PIN functionality
  const [showResetPin, setShowResetPin] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: send OTP, 2: verify OTP & set new PIN
  const [resetEmailOtp, setResetEmailOtp] = useState('');
  const [resetNewPin, setResetNewPin] = useState('');
  const [resetConfirmPin, setResetConfirmPin] = useState('');
  const [resetStatus, setResetStatus] = useState({ success: null, error: null });
  const [resetLoading, setResetLoading] = useState(false);

  // Safe useEffect with error handling
  useEffect(() => {
    try {
      fetchUPIInfo();
      fetchTransactions();
    } catch (error) {
      console.error('Error in initial fetch:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (activeTab === 'manage' && user) {
        fetchMoneyRequests();
      }
    } catch (error) {
      console.error('Error in manage tab fetch:', error);
    }
  }, [activeTab, user]);

  const fetchUPIInfo = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;
      
      const response = await axiosClient.get('/upi/info', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = response.data;
      console.log('UPI Info:', data);
      setUpiInfo(data);
    } catch (error) {
      console.error('Error fetching UPI info:', error);
      // Don't set error state here as this is optional data
    }
  };

  const fetchTransactions = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;

      setUpiLoading(true);
      const response = await axiosClient.get('/upi/transactions', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setUpiLoading(false);
    }
  };

  // Safe money request fetching
  const fetchMoneyRequests = async () => {
    if (!user) return;
    
    setRequestsLoading(true);
    setRequestsError(null);
    
    try {
      if (typeof window === 'undefined') return;
      
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setRequestsError('Authentication required');
        return;
      }
      
      const response = await axiosClient.get('/upi/money-requests', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      if (response.data && response.data.requests) {
        setMoneyRequests(response.data.requests);
      } else {
        setMoneyRequests([]);
      }
    } catch (error) {
      console.error('Error fetching money requests:', error);
      setRequestsError(error.response?.data?.msg || error.message || 'Failed to fetch money requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  // Respond to money request
  const respondToRequest = async (requestId, action, pin = null, reason = null) => {
    try {
      if (typeof window === 'undefined') return;
      
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        alert('Authentication required. Please login again.');
        return;
      }
      
      const response = await axiosClient.post(`/upi/money-requests/${requestId}/respond`, {
        action,
        pin,
        reason
      }, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      // Refresh requests list
      await fetchMoneyRequests();
      
      // Show success message
      alert(response.data?.message || 'Request processed successfully');
      
    } catch (error) {
      console.error('Error responding to request:', error);
      alert(error.response?.data?.msg || error.message || 'Failed to process request');
    }
  };

  // Validate UPI for money request
  const validateUPIForRequest = async (upi_id) => {
    if (!upi_id || upi_id.length < 3) {
      setRequestValidation({ valid: false, message: 'UPI ID is too short' });
      return;
    }

    try {
      if (typeof window === 'undefined') return;
      
      const currentToken = localStorage.getItem('token');
      const response = await axiosClient.get(`/upi/validate/${upi_id}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      setRequestValidation({ 
        valid: response.data.valid, 
        message: response.data.message,
        user: response.data.user 
      });
    } catch (error) {
      setRequestValidation({ 
        valid: false, 
        message: error.response?.data?.msg || 'Error validating UPI ID' 
      });
    }
  };

  // Send money request
  const sendMoneyRequest = async () => {
    if (!requestForm.from_upi || !requestForm.amount) {
      setRequestStatus({ success: null, error: 'Please fill all required fields' });
      return;
    }

    if (!requestValidation?.valid) {
      setRequestStatus({ success: null, error: 'Please enter a valid UPI ID' });
      return;
    }

    setRequestLoading(true);
    setRequestStatus({ success: null, error: null });

    try {
      if (typeof window === 'undefined') return;
      
      const currentToken = localStorage.getItem('token');
      const response = await axiosClient.post('/upi/request-money', {
        from_upi: requestForm.from_upi,
        amount: requestForm.amount,
        note: requestForm.note || 'Money request'
      }, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      setRequestStatus({ 
        success: 'Money request sent successfully!', 
        error: null 
      });
      
      // Reset form
      setRequestForm({ from_upi: '', amount: '', note: '' });
      setRequestValidation(null);
      
    } catch (error) {
      setRequestStatus({ 
        success: null, 
        error: error.response?.data?.msg || 'Failed to send money request' 
      });
    } finally {
      setRequestLoading(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Safe render with error boundary
  const renderContent = () => {
    try {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
          <div className="max-w-4xl mx-auto py-10 px-4">
            {/* Hero Header */}
            <div className="flex flex-col items-center mb-10">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full p-4 shadow-lg mb-4">
                <MdPayment className="text-white text-5xl" />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">CBI Bank UPI</h1>
              <p className="text-lg text-gray-600 mb-2">Fast, Secure & Instant Payments</p>
              {user && <p className="text-sm text-gray-500">Welcome, {user.name || 'User'}</p>}
            </div>

            {/* UPI Balance Card */}
            {upiInfo && (
              <div className="bg-white/90 rounded-2xl shadow-xl p-6 mb-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-tr from-green-600 to-blue-500 rounded-full p-3 shadow-lg">
                    <MdAccountBalance className="text-white text-3xl" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">UPI Balance</h2>
                <div className="text-2xl font-bold text-indigo-700">{formatCurrency(upiInfo.balance || 0)}</div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/80 rounded-full p-1 shadow-md flex gap-2">
                {[
                  { id: 'pay', label: 'Pay', icon: MdSend },
                  { id: 'request', label: 'Request', icon: FaHandHoldingUsd },
                  { id: 'manage', label: 'Manage', icon: MdRequest },
                  { id: 'history', label: 'History', icon: MdHistory }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:bg-blue-100'
                    }`}
                  >
                    <Icon />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'pay' && (
              <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
                  <MdSend />
                  Send Money
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., user@paytm)"
                    value={paymentForm.recipient_upi}
                    onChange={(e) => setPaymentForm({...paymentForm, recipient_upi: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Continue to Pay
                  </button>
                </div>
              </div>
            )}

            {/* Request Tab */}
            {activeTab === 'request' && (
              <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
                  <FaHandHoldingUsd />
                  Request Money
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter UPI ID to request from"
                      value={requestForm.from_upi}
                      onChange={(e) => {
                        setRequestForm({...requestForm, from_upi: e.target.value});
                        if (e.target.value) {
                          validateUPIForRequest(e.target.value);
                        }
                      }}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    {requestValidation && (
                      <p className={`text-sm mt-2 ${requestValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                        {requestValidation.message}
                      </p>
                    )}
                  </div>
                  
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm({...requestForm, amount: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={requestForm.note}
                    onChange={(e) => setRequestForm({...requestForm, note: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  
                  <button
                    onClick={sendMoneyRequest}
                    disabled={requestLoading || !requestValidation?.valid}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestLoading ? 'Sending Request...' : 'Send Money Request'}
                  </button>
                </div>

                {/* Status Messages */}
                {requestStatus.success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-700">{requestStatus.success}</p>
                  </div>
                )}
                
                {requestStatus.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{requestStatus.error}</p>
                  </div>
                )}

                {/* How it works */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">How Money Request Works</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enter the UPI ID of the person you want to request money from</li>
                    <li>• Specify the amount and add a note (optional)</li>
                    <li>• They will receive a notification to approve/decline your request</li>
                    <li>• Once approved, money will be transferred to your account</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Manage Tab - Money Requests */}
            {activeTab === 'manage' && (
              !user ? (
                <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-8">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading user data...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
                      <MdRequest />
                      Manage Money Requests
                    </h2>
                    <button
                      onClick={fetchMoneyRequests}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={requestsLoading}
                    >
                      {requestsLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>

                  {requestsError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700">{requestsError}</p>
                      <p className="text-sm text-red-600 mt-2">
                        Please check your internet connection or try refreshing the page.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {requestsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading requests...</p>
                      </div>
                    ) : moneyRequests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MdRequest className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>No money requests found</p>
                      </div>
                    ) : (
                      moneyRequests.filter(request => request && request.from_user && request.to_user).map((request) => (
                        <div key={request.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {request.status.toUpperCase()}
                                </span>
                                {request.expires_at && new Date() > new Date(request.expires_at) && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {request.from_user._id === user?._id ? 'Requested from' : 'Request from'}:
                                  </p>
                                  <p className="font-medium">
                                    {request.from_user._id === user?._id ? 
                                      `${request.to_user?.name} (${request.to_user?.upi_id})` : 
                                      `${request.from_user?.name} (${request.from_user?.upi_id})`
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Amount:</p>
                                  <p className="font-bold text-blue-600">{formatCurrency(request.amount)}</p>
                                </div>
                              </div>

                              {request.note && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-500">Note:</p>
                                  <p className="text-gray-700">{request.note}</p>
                                </div>
                              )}

                              <div className="text-sm text-gray-500">
                                <p>Created: {formatDate(request.created_at)}</p>
                                {request.expires_at && (
                                  <p>Expires: {formatDate(request.expires_at)}</p>
                                )}
                                {request.responded_at && (
                                  <p>Responded: {formatDate(request.responded_at)}</p>
                                )}
                              </div>
                            </div>

                            {/* Action buttons for received requests */}
                            {request.to_user?._id === user?._id && request.status === 'pending' && 
                             new Date() <= new Date(request.expires_at) && (
                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={() => {
                                    const pin = prompt('Enter your UPI PIN to approve this request:');
                                    if (pin) {
                                      respondToRequest(request.id, 'approve', pin);
                                    }
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter reason for rejection (optional):');
                                    respondToRequest(request.id, 'reject', null, reason || 'Declined');
                                  }}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>

                          {request.rejection_reason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-700">
                                <strong>Rejection reason:</strong> {request.rejection_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-blue-800 mb-2">How to Manage Requests</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• View all your sent and received money requests</li>
                      <li>• Approve requests by entering your UPI PIN</li>
                      <li>• Reject requests with an optional reason</li>
                      <li>• Requests expire after 24 hours automatically</li>
                    </ul>
                  </div>
                </div>
              )
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white/90 rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
                  <MdHistory />
                  Transaction History
                </h2>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MdPayment className="text-4xl mx-auto mb-2 opacity-50" />
                      <p>No UPI transactions yet</p>
                    </div>
                  ) : (
                    transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.remark}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </p>
                            {transaction.sender_upi && (
                              <p className="text-xs text-gray-400">From: {transaction.sender_upi}</p>
                            )}
                            {transaction.recipient_upi && (
                              <p className="text-xs text-gray-400">To: {transaction.recipient_upi}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.isSuccess 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.isSuccess ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="max-w-4xl mx-auto px-4 pb-10">
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <FaHandHoldingUsd className="text-3xl text-purple-600" />,
                  title: "Money Requests",
                  description: "Request money from other UPI users instantly"
                },
                {
                  icon: <MdSend className="text-3xl text-green-600" />,
                  title: "Instant Transfers",
                  description: "Send money instantly using UPI ID"
                },
                {
                  icon: <MdAccountBalance className="text-3xl text-purple-600" />,
                  title: "24/7 Available",
                  description: "Transfer money anytime, anywhere"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white/90 rounded-2xl shadow-xl p-6 text-center hover:scale-105 transition-transform">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('UPI Page render error:', error);
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
              <p className="text-gray-700 mb-6">
                We're sorry, but there was an error loading the UPI page. 
                Please refresh the page or contact support if the problem persists.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  return renderContent();
};

export default UPIPage;