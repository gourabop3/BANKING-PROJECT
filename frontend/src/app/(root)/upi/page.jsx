"use client";
import React, { useState, useEffect } from 'react';
import HeaderName from '@/components/HeaderName';
import { MdQrCode, MdSend, MdHistory, MdAccountBalance, MdPayment } from 'react-icons/md';
import { FaDownload, FaShare, FaCopy, FaCheck } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';

const UPIPage = () => {
  const { user } = useMainContext();
  const [activeTab, setActiveTab] = useState('pay');
  const [upiInfo, setUpiInfo] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Payment form states
  const [paymentForm, setPaymentForm] = useState({
    recipient_upi: '',
    amount: '',
    note: '',
    pin: ''
  });

  // QR generation form states
  const [qrForm, setQrForm] = useState({
    amount: '',
    note: ''
  });

  const [validationResult, setValidationResult] = useState(null);

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

  useEffect(() => {
    fetchUPIInfo();
    fetchTransactions();
  }, []);

  const fetchUPIInfo = async () => {
    try {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      if (!currentToken) return;
      
      const response = await axiosClient.get('/upi/info', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = response.data;
      if (response.status === 200) {
        setUpiInfo(data.upi_info);
      }
    } catch (error) {
      console.error('Error fetching UPI info:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      if (!currentToken) return;
      
      const response = await axiosClient.get('/upi/transactions?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = response.data;
      if (response.status === 200) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const generateQR = async () => {
    setLoading(true);
    try {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      if (!currentToken) return;
      
      const response = await axiosClient.get(`/upi/qr?amount=${qrForm.amount}&note=${qrForm.note}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = response.data;
      if (response.status === 200) {
        setQrCode(data);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateUPI = async (upi_id) => {
    if (!upi_id) return;
    try {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      if (!currentToken) return;
      
      const response = await axiosClient.get(`/upi/validate/${upi_id}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = response.data;
      setValidationResult(data);
    } catch (error) {
      console.error('Error validating UPI:', error);
    }
  };

  const validateRegistrationInputs = () => {
    // Reset validation
    setFormValidation({ upi_id: null, pin: null, confirm_pin: null });

    const errors = { upi_id: null, pin: null, confirm_pin: null };

    // Check if UPI ID is provided
    if (!registrationForm.upi_id.trim()) {
      errors.upi_id = 'UPI ID is required';
    } else {
      // UPI ID must end with @cbibank and have at least 2 chars before @
      const upiRegex = /^[a-zA-Z0-9._-]{2,}@cbibank$/;
      if (!upiRegex.test(registrationForm.upi_id)) {
        errors.upi_id = 'UPI ID must end with @cbibank (e.g., yourname@cbibank)';
      }
    }

    // Check if PIN is provided
    if (!registrationForm.pin.trim()) {
      errors.pin = 'PIN is required';
    } else {
      // PIN must be 4 or 6 digits
      const pinRegex = /^\d{4}$|^\d{6}$/;
      if (!pinRegex.test(registrationForm.pin)) {
        errors.pin = 'PIN must be exactly 4 or 6 digits';
      }
    }

    // Check if confirm PIN is provided
    if (!registrationForm.confirm_pin.trim()) {
      errors.confirm_pin = 'Please confirm your PIN';
    } else if (registrationForm.pin !== registrationForm.confirm_pin) {
      errors.confirm_pin = 'PINs do not match';
    }

    setFormValidation(errors);
    return !errors.upi_id && !errors.pin && !errors.confirm_pin;
  };

  const registerUPI = async () => {
    setRegistrationSuccess(null);
    setRegistrationError(null);

    if (!validateRegistrationInputs()) {
      return;
    }
    
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    if (!currentToken) {
      setRegistrationError('Please log in to create UPI ID');
      return;
    }
    
    console.log('Attempting UPI registration with:', {
      upi_id: registrationForm.upi_id,
      pin: registrationForm.pin.replace(/./g, '*'),
      token: currentToken ? 'Token present' : 'No token'
    });
    
    setLoading(true);
    try {
      const response = await axiosClient.post('/upi/register', { 
        upi_id: registrationForm.upi_id, 
        pin: registrationForm.pin 
      }, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      const data = response.data;
      if (data && data.upi_id) {
        setRegistrationSuccess('UPI ID created successfully!');
        setRegistrationError(null);
        setRegistrationForm({ upi_id: '', pin: '', confirm_pin: '' });
        fetchUPIInfo();
      } else {
        setRegistrationError(data.msg || 'Registration failed');
        setRegistrationSuccess(null);
      }
    } catch (error) {
      console.error('Error registering UPI:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      
      let errorMessage = 'Network error: Unable to register UPI';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Please log in again to create UPI ID';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.msg || 
                        error.response.data?.message || 
                        'Invalid UPI ID or PIN format';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.msg || 
                        error.response.data?.message || 
                        `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        // Network error - no response received
        errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setRegistrationError(errorMessage);
      setRegistrationSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      if (!currentToken) {
        setPaymentStatus({ success: null, error: 'Please log in to make payment' });
        return;
      }
      
      const { data } = await axiosClient.post('/upi/pay', paymentForm, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (data && data.status === 'success') {
        setPaymentStatus({ success: 'Payment successful!', error: null });
        setPaymentForm({ recipient_upi: '', amount: '', note: '', pin: '' });
        
        // Immediately update balance and transactions
        await Promise.all([
          fetchTransactions(),
          fetchUPIInfo()
        ]);
        
        // Show success message for a few seconds before redirecting
        setTimeout(() => {
          const successParams = new URLSearchParams({
            transaction_id: data.transaction_id,
            amount: data.amount.toString(),
            recipient_upi: data.recipient_upi,
            sender_upi: data.sender_upi,
            note: data.note || '',
            timestamp: data.timestamp
          });
          window.location.href = `/upi/payment-success?${successParams.toString()}`;
        }, 2000);
      } else {
        setPaymentStatus({ success: null, error: data.msg || 'Payment failed' });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error.response?.data?.msg || 
                          error.response?.data?.message || 
                          error.message || 
                          'Network error: payment failed';
      setPaymentStatus({ success: null, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiInfo?.upi_id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enhanced polling for balance and transactions updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTransactions();
      fetchUPIInfo(); // Also refresh balance every 15 seconds
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto clear success/error msgs after 3 seconds
  useEffect(() => {
    if (registrationSuccess || registrationError) {
      const t = setTimeout(() => {
        setRegistrationSuccess(null);
        setRegistrationError(null);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [registrationSuccess, registrationError]);

  useEffect(() => {
    if (paymentStatus.success || paymentStatus.error) {
      const t = setTimeout(() => setPaymentStatus({ success: null, error: null }), 3000);
      return () => clearTimeout(t);
    }
  }, [paymentStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container py-6 px-4">
        <HeaderName />
        
        {/* UPI Registration/Update Card - Show for all users */}
        <Card className="mb-6 p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MdQrCode className="text-blue-600" />
            {(!upiInfo || !upiInfo.upi_id) ? 'Create Your UPI ID' : 'Update Your UPI ID'}
          </h2>
          {(!upiInfo || !upiInfo.upi_id) ? (
            <p className="text-gray-600 mb-4">Create your unique UPI ID to start making instant payments.</p>
          ) : (
            <p className="text-gray-600 mb-4">Current UPI ID: <span className="font-mono font-semibold text-blue-600">{upiInfo.upi_id}</span>. You can update to a new UPI ID below.</p>
          )}
            {registrationError && (
              <p className="text-red-600 text-sm mb-2">{registrationError}</p>
            )}
            {registrationSuccess && (
              <p className="text-green-600 text-sm mb-2">{registrationSuccess}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desired UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@cbibank"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formValidation.upi_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={registrationForm.upi_id}
                  disabled={loading}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setRegistrationForm(prev => ({ ...prev, upi_id: value }));
                  }}
                  onBlur={() => {
                    if (registrationForm.upi_id && !registrationForm.upi_id.includes('@')) {
                      setRegistrationForm(prev => ({ ...prev, upi_id: prev.upi_id + '@cbibank' }));
                    }
                  }}
                />
                {formValidation.upi_id && (
                  <p className="text-red-600 text-xs mt-1">{formValidation.upi_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Set UPI PIN</label>
                <input
                  type="password"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formValidation.pin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={registrationForm.pin}
                  maxLength="6"
                  placeholder="Enter 4 or 6 digit PIN"
                  disabled={loading}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setRegistrationForm(prev => ({ ...prev, pin: value }));
                  }}
                />
                {formValidation.pin && (
                  <p className="text-red-600 text-xs mt-1">{formValidation.pin}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm UPI PIN</label>
                <input
                  type="password"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formValidation.confirm_pin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={registrationForm.confirm_pin}
                  maxLength="6"
                  placeholder="Confirm your PIN"
                  disabled={loading}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setRegistrationForm(prev => ({ ...prev, confirm_pin: value }));
                  }}
                />
                {formValidation.confirm_pin && (
                  <p className="text-red-600 text-xs mt-1">{formValidation.confirm_pin}</p>
                )}
              </div>
              <button
                onClick={registerUPI}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : ((!upiInfo || !upiInfo.upi_id) ? 'Create UPI ID' : 'Update UPI ID')}
              </button>
            </div>
        </Card>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CBI Bank UPI
          </h1>
          <p className="text-lg text-gray-600">
            Fast, Secure & Instant Payments
          </p>
        </div>

        {/* UPI Info Card */}
        {upiInfo && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your UPI ID</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono">{upiInfo.upi_id}</span>
                  <button
                    onClick={copyUPIId}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(upiInfo.balance)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-md">
            {[
              { id: 'pay', label: 'Pay', icon: MdSend },
              { id: 'receive', label: 'Receive', icon: MdQrCode },
              { id: 'history', label: 'History', icon: MdHistory }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-2xl mx-auto">
          {/* Pay Tab */}
          {activeTab === 'pay' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MdSend className="text-blue-600" />
                Send Money
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="example@cbibank"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentForm.recipient_upi}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPaymentForm(prev => ({ ...prev, recipient_upi: value }));
                      if (value.includes('@')) {
                        validateUPI(value);
                      }
                    }}
                  />
                  {validationResult && (
                    <div className={`mt-2 text-sm ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationResult.valid 
                        ? `Valid UPI ID - ${validationResult.user?.name}`
                        : validationResult.message
                      }
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI PIN
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your UPI PIN"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentForm.pin}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, pin: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Payment for..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))}
                  />
                </div>

                {paymentStatus.error && (
                  <p className="text-red-600 text-sm">{paymentStatus.error}</p>
                )}
                {paymentStatus.success && (
                  <p className="text-green-600 text-sm">{paymentStatus.success}</p>
                )}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || !paymentForm.recipient_upi || !paymentForm.amount || !paymentForm.pin}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Send Money'}
                </button>
              </div>
            </Card>
          )}

          {/* Receive Tab */}
          {activeTab === 'receive' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MdQrCode className="text-blue-600" />
                Receive Money
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) - Optional
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={qrForm.amount}
                    onChange={(e) => setQrForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note - Optional
                  </label>
                  <input
                    type="text"
                    placeholder="Payment for..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={qrForm.note}
                    onChange={(e) => setQrForm(prev => ({ ...prev, note: e.target.value }))}
                  />
                </div>

                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate QR Code'}
                </button>
              </div>

              {qrCode && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img 
                      src={qrCode.qr} 
                      alt="UPI QR Code" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      Scan with any UPI app to pay {upiInfo?.name}
                    </p>
                    {qrCode.amount && (
                      <p className="text-lg font-semibold text-blue-600">
                        Amount: {formatCurrency(qrCode.amount)}
                      </p>
                    )}
                    <div className="flex justify-center gap-2 mt-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <FaDownload />
                        Download
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <FaShare />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MdHistory className="text-blue-600" />
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
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <MdQrCode className="text-3xl text-blue-600" />,
              title: "QR Payments",
              description: "Generate and scan QR codes for instant payments"
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
            <Card key={index} className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md animate-scaleIn">
              <h3 className="text-xl font-bold mb-4">Confirm Payment</h3>
              <p className="mb-2">Recipient: <span className="font-semibold">{paymentForm.recipient_upi}</span></p>
              <p className="mb-2">Amount: <span className="font-semibold">₹{paymentForm.amount}</span></p>
              <p className="mb-4">Note: {paymentForm.note || '—'}</p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowConfirm(false)}
                >Cancel</button>
                <button
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => {
                    setShowConfirm(false);
                    processPayment();
                  }}
                >{loading ? 'Processing...' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UPIPage;