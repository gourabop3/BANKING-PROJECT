"use client";
import { useMainContext } from '@/context/MainContext';
import React, { useEffect, useState } from 'react';
import HeaderName from '@/components/HeaderName';
import RenGenerateModal from './+__(components)/RenGenerateModal';
import SimpleBankAccountSection from './+__(components)/SimpleBankAccountSection';
import ErrorBoundary from './+__(components)/ErrorBoundary';
import { FaCopy, FaKey, FaShieldAlt, FaCode, FaLock, FaEye, FaEyeSlash, FaSync, FaInfoCircle, FaCreditCard, FaChartLine, FaCog, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { MdSecurity, MdVpnKey, MdDeveloperMode, MdPayment, MdSwapHoriz } from 'react-icons/md';
import { toast } from 'react-toastify';
import { axiosClient } from '@/utils/AxiosClient';

// Helper function to truncate long strings like API keys/hashes for cleaner UI
const truncateString = (str, front = 6, back = 4) => {
  if (!str) return '';
  if (str.length <= front + back) return str;
  return `${str.slice(0, front)}...${str.slice(-back)}`;
};

const copy = (text) => {
  if(!text) return;
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Copied to clipboard');
  }).catch(()=>{
    toast.error('Failed to copy');
  });
};

const ApiKeyPage = () => {
  const { user } = useMainContext();
  const [apiKeys, setApiKeys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isUpdatingWebhook, setIsUpdatingWebhook] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAPIKeys();
    } else {
      setLoading(false);
    }
  }, [user]);

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-700 mb-6 text-sm">Please log in to access the API keys section.</p>
            <button
              onClick={() => window.location.href = "/login"}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fetchAPIKeys = async () => {
    try {
      setLoading(true);
      setHasError(false);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error('Please login to continue');
        setLoading(false);
        return;
      }

      const response = await axiosClient.get('/api-keys/get-keys', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      const data = response.data;
      setApiKeys(data);
      setWebhookUrl(data.webhook_config?.url || '');

    } catch (error) {
      console.error('Error fetching API keys:', error);
      setHasError(true);
      
      // Handle different types of errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        toast.error('Unable to connect to server. Please check if the backend is running.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please contact support.');
      } else {
        const errorMessage = error?.response?.data?.msg || error?.message || 'Failed to fetch API keys';
        toast.error(errorMessage);
      }
      
      // Set a safe default state to prevent ErrorBoundary from triggering
      setApiKeys({
        hasAPIKey: false,
        msg: 'Failed to load API keys'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnvironmentSwitch = async (environment) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.put('/api-keys/environment/switch', 
        { environment }, 
        {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }
      );
      toast.success(`Switched to ${environment} environment`);
      fetchAPIKeys();
    } catch (error) {
      toast.error('Failed to switch environment');
    }
  };

  const handleWebhookSave = async () => {
    try {
      setIsUpdatingWebhook(true);
      const token = localStorage.getItem("token");
      const response = await axiosClient.put('/api-keys/webhook/config',
        { webhook_url: webhookUrl },
        {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }
      );
      toast.success('Webhook URL saved successfully');
      fetchAPIKeys();
    } catch (error) {
      toast.error('Failed to save webhook URL');
    } finally {
      setIsUpdatingWebhook(false);
    }
  };

  const getBaseUrl = () => {
    return apiKeys?.environment === 'live' 
      ? 'https://api.cbibank.com/v1' 
      : 'https://sandbox.cbibank.com/v1';
  };

  // Safety check to prevent undefined access
  const safeApiKeys = apiKeys || { hasAPIKey: false };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading API keys...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error loading API keys
  if (hasError && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FaInfoCircle className="text-2xl text-red-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Unable to Load API Keys
            </h2>
            
            <p className="text-gray-700 mb-6 text-sm">
              We couldn't load your API keys at this time. This might be due to a server connection issue.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => fetchAPIKeys()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaSync className="text-sm" />
                Retry
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container py-6 md:py-10 px-4 md:px-6">
          <HeaderName/>

          {/* Professional Status Bar */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-semibold text-sm">All Systems Operational</span>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-green-700">
                  <span>API Response Time: <strong>150ms</strong></span>
                  <span>Uptime: <strong>99.9%</strong></span>
                  <span>Region: <strong>Asia Pacific</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-green-600 text-lg" />
                <div className="text-right">
                  <div className="text-xs text-green-700">Professional Payment Gateway</div>
                  <div className="text-xs text-green-600 font-medium">Ready for Integration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaKey className="text-2xl md:text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    CBI Payment Gateway
                  </h2>
                  <p className="text-sm md:text-base text-white opacity-90">
                    Professional API Management & Integration Platform
                  </p>
                </div>
              </div>
              
              {/* Environment Switch */}
              {apiKeys?.hasAPIKey && (
                <div className="flex items-center gap-3">
                  <span className="text-sm opacity-90">Environment:</span>
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg p-2">
                    <button
                      onClick={() => handleEnvironmentSwitch('test')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        apiKeys.environment === 'test' 
                          ? 'bg-white text-indigo-600' 
                          : 'text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      Test
                    </button>
                    <button
                      onClick={() => handleEnvironmentSwitch('live')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        apiKeys.environment === 'live' 
                          ? 'bg-white text-indigo-600' 
                          : 'text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      Live
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* API Keys Section */}
          {apiKeys?.hasAPIKey ? (
            <div className="space-y-8">
              {/* API Usage Analytics */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">API Usage Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {apiKeys.usage_analytics?.today_requests || 0}
                    </div>
                    <div className="text-sm text-blue-700">Requests Today</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {apiKeys.usage_analytics?.success_rate || '100.0'}%
                    </div>
                    <div className="text-sm text-green-700">Success Rate</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {apiKeys.usage_analytics?.total_requests || 0}
                    </div>
                    <div className="text-sm text-purple-700">Total Requests</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {apiKeys.rate_limits?.requests_per_day?.toLocaleString() || '10,000'}
                    </div>
                    <div className="text-sm text-orange-700">Daily Limit</div>
                  </div>
                </div>
              </div>

              {/* API Credentials */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">API Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <APICredentialCard
                    title="API Secret"
                    description="Your private API secret key for authentication"
                    value={apiKeys.api_secret}
                    icon={<FaKey className="text-blue-600" />}
                    bgGradient="from-blue-500 to-blue-600"
                    copyLabel="API Secret"
                  />
                  <APICredentialCard
                    title="API Hash"
                    description="Unique hash for request verification"
                    value={apiKeys.api_hash}
                    icon={<FaShieldAlt className="text-purple-600" />}
                    bgGradient="from-purple-500 to-purple-600"
                    copyLabel="API Hash"
                  />
                  <APICredentialCard
                    title="Gateway Key"
                    description="Payment gateway integration key"
                    value={apiKeys.payment_gateway_key}
                    icon={<FaCreditCard className="text-green-600" />}
                    bgGradient="from-green-500 to-green-600"
                    copyLabel="Gateway Key"
                  />
                  <APICredentialCard
                    title="Merchant ID"
                    description="Your unique merchant identifier"
                    value={apiKeys.merchant_id}
                    icon={<MdPayment className="text-indigo-600" />}
                    bgGradient="from-indigo-500 to-indigo-600"
                    copyLabel="Merchant ID"
                  />
                </div>
              </div>

              {/* Integration Guide */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Integration Guide</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
                    <code>{`curl -X POST ${getBaseUrl()}/payments/create \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${truncateString(apiKeys.api_secret, 8, 8)}" \\
  -H "X-API-Hash: ${truncateString(apiKeys.api_hash, 8, 8)}" \\
  -d '{
    "merchant_id": "${apiKeys.merchant_id}",
    "amount": 1000,
    "currency": "INR",
    "customer_email": "customer@example.com"
  }'`}</code>
                  </pre>
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  <p>Base URL: <code className="bg-gray-200 px-2 py-1 rounded text-gray-900 font-medium">{getBaseUrl()}</code></p>
                  <p>Rate Limit: <strong>{apiKeys.rate_limits?.requests_per_day?.toLocaleString() || '10,000'}</strong> requests/day</p>
                </div>
              </div>

              {/* Developer Resources */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Developer Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <FaCode className="text-2xl text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-800">API Documentation</h4>
                    <p className="text-sm text-blue-700">Complete API reference</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <FaShieldAlt className="text-2xl text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-800">Security Guidelines</h4>
                    <p className="text-sm text-green-700">Best practices & security</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <FaCog className="text-2xl text-purple-600 mb-2" />
                    <h4 className="font-semibold text-purple-800">Webhook Guide</h4>
                    <p className="text-sm text-purple-700">Event handling setup</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <FaCode className="text-2xl text-orange-600 mb-2" />
                    <h4 className="font-semibold text-orange-800">SDK Downloads</h4>
                    <p className="text-sm text-orange-700">Ready-to-use libraries</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="bg-blue-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaKey className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No API Keys Generated</h3>
              <p className="text-gray-700 mb-6">Generate your first set of API keys for payment gateway integration</p>
              <RenGenerateModal onSuccess={fetchAPIKeys} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

const APICredentialCard = ({ 
  title, 
  description, 
  value, 
  icon, 
  bgGradient, 
  copyLabel,
  truncateFront = 6,
  truncateBack = 4 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = () => {
    copy(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className={`h-1 bg-gradient-to-r ${bgGradient}`}></div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 p-2 rounded-lg">
              {icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
              <p className="text-gray-700 text-xs">{description}</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
            title={isVisible ? 'Hide' : 'Show'}
          >
            {isVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <code className="text-xs font-mono text-gray-900 flex-1 mr-2 font-medium">
              {isVisible ? value : truncateString(value, truncateFront, truncateBack)}
            </code>
            <button
              onClick={handleCopy}
              className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
              title={copyLabel || 'Copy to clipboard'}
            >
              <FaCopy className="text-xs" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-700">
          <span>Environment: Test</span>
          <span>Last regenerated: Never</span>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPage;