"use client";

import React, { useEffect, useState } from 'react';
import HeaderName from '@/components/HeaderName';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';
import { FaCode, FaKey, FaPlug, FaReact, FaNodeJs, FaHtml5, FaJs, FaDownload, FaBook, FaExternalLinkAlt, FaShieldAlt, FaCog, FaInfoCircle, FaCopy, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const truncate = (str = '', front = 6, back = 4) => {
  if (str.length <= front + back) return str;
  return `${str.slice(0, front)}...${str.slice(-back)}`;
};

// CodeBlock component with copy functionality
const CodeBlock = ({ code, language = 'text', title }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="relative">
      {title && (
        <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg border-b border-gray-700">
          <span className="text-sm font-medium">{title}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <div className={`bg-gray-900 ${title ? 'rounded-b-lg' : 'rounded-lg'} p-4 overflow-x-auto relative group`}>
        {!title && (
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs transition-all opacity-0 group-hover:opacity-100"
            title="Copy to clipboard"
          >
            {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        <pre className="text-green-400 text-sm whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    </div>
  );
};

export default function ApiUsePage() {
  const { user } = useMainContext();
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('react');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchKeys = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axiosClient.get('/api-keys/get-keys', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKeys(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, [user]);

  const getBaseUrl = () => {
    return keys?.environment === 'live' 
      ? 'https://api.cbibank.com/v1' 
      : 'https://sandbox.cbibank.com/v1'
  }

  const copy = (text) => {
    if(!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(()=>{
      toast.error('Failed to copy');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container py-6 md:py-10 px-4 md:px-6">
        <HeaderName />

        {/* Hero Section */}
         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <FaPlug className="text-2xl md:text-3xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Developer Integration Guide</h2>
              <p className="text-indigo-100">Complete API documentation with code examples for all platforms</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="text-sm text-gray-700">Environment</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {keys?.environment || 'Test'}
              </div>
            </div>
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="text-sm text-gray-700">API Version</div>
              <div className="text-lg font-semibold text-gray-900">v1.0</div>
            </div>
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="text-sm text-gray-700">Support</div>
              <div className="text-lg font-semibold text-gray-900">24/7</div>
            </div>
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="text-sm text-gray-700">Uptime</div>
              <div className="text-lg font-semibold text-gray-900">99.9%</div>
            </div>
          </div>
        </div>

        {keys?.hasAPIKey ? (
          <>
            {/* Quick Reference Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaKey className="text-green-600" />
                Your API Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                  <div className="text-sm text-blue-700 mb-2">API Secret</div>
                  <div className="font-mono text-blue-900 text-sm break-all">
                    {truncate(keys.api_secret, 8, 8)}
                  </div>
                  <button 
                    onClick={() => copy(keys.api_secret)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Click to copy full key
                  </button>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                  <div className="text-sm text-purple-700 mb-2">API Hash</div>
                  <div className="font-mono text-purple-900 text-sm break-all">
                    {truncate(keys.api_hash, 8, 6)}
                  </div>
                  <button 
                    onClick={() => copy(keys.api_hash)}
                    className="text-xs text-purple-600 hover:text-purple-800 mt-2"
                  >
                    Click to copy full hash
                  </button>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                  <div className="text-sm text-green-700 mb-2">Payment Gateway Key</div>
                  <div className="font-mono text-green-900 text-sm break-all">
                    {truncate(keys.payment_gateway_key, 8, 6)}
                  </div>
                  <button 
                    onClick={() => copy(keys.payment_gateway_key)}
                    className="text-xs text-green-600 hover:text-green-800 mt-2"
                  >
                    Click to copy full key
                  </button>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
                  <div className="text-sm text-orange-700 mb-2">Merchant ID</div>
                  <div className="font-mono text-orange-900 text-sm break-all">
                    {keys.merchant_id}
                  </div>
                  <button 
                    onClick={() => copy(keys.merchant_id)}
                    className="text-xs text-orange-600 hover:text-orange-800 mt-2"
                  >
                    Click to copy
                  </button>
                </div>
              </div>
            </div>

            {/* Comprehensive Developer Documentation */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaBook className="text-indigo-600" />
                Complete Integration Guide
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  keys.environment === 'live' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {keys.environment === 'live' ? 'LIVE ENVIRONMENT' : 'TEST ENVIRONMENT'}
                </span>
              </h3>

              {/* Technology Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 p-2 rounded-xl">
                {[
                  { id: 'react', label: 'React.js', icon: <FaReact className="text-blue-500" /> },
                  { id: 'nodejs', label: 'Node.js', icon: <FaNodeJs className="text-green-600" /> },
                  { id: 'html', label: 'HTML/CSS', icon: <FaHtml5 className="text-orange-600" /> },
                  { id: 'javascript', label: 'Vanilla JS', icon: <FaJs className="text-yellow-600" /> }
                ].map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === id
                        ? 'bg-white text-gray-800 shadow-md'
                        : 'text-gray-600 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              {/* React.js Integration */}
              {activeTab === 'react' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <FaReact className="text-blue-500" />
                      React.js Payment Integration
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-blue-700 mb-2">1. Install Required Package</h5>
                        <CodeBlock 
                          code={`npm install axios
# or
yarn add axios`}
                          title="Package Installation"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-blue-700 mb-2">2. Create Payment Component</h5>
                        <CodeBlock 
                          code={`import React, { useState } from 'react';
import axios from 'axios';

const PaymentComponent = () => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    customer_email: '',
    customer_name: ''
  });
  const [loading, setLoading] = useState(false);

  const API_CONFIG = {
    baseURL: '${getBaseUrl()}',
    headers: {
      'Authorization': 'Bearer ${truncate(keys.api_secret, 8, 8)}',
      'Content-Type': 'application/json',
      'X-API-Hash': '${truncate(keys.api_hash, 8, 8)}',
      'X-Merchant-ID': '${keys.merchant_id}'
    }
  };

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/payments', {
        merchant_id: '${keys.merchant_id}',
        amount: parseFloat(paymentData.amount),
        currency: 'INR',
        customer_email: paymentData.customer_email,
        customer_name: paymentData.customer_name,
        callback_url: window.location.origin + '/payment/callback',
        webhook_url: '${keys.webhook_config?.url || 'https://yoursite.com/webhook/payment'}'
      }, API_CONFIG);

      // Redirect to payment gateway
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Payment failed: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Make Payment</h2>
      
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Amount (₹)"
          value={paymentData.amount}
          onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
          className="w-full p-3 border rounded-lg"
        />
        
        <input
          type="email"
          placeholder="Customer Email"
          value={paymentData.customer_email}
          onChange={(e) => setPaymentData({...paymentData, customer_email: e.target.value})}
          className="w-full p-3 border rounded-lg"
        />
        
        <input
          type="text"
          placeholder="Customer Name"
          value={paymentData.customer_name}
          onChange={(e) => setPaymentData({...paymentData, customer_name: e.target.value})}
          className="w-full p-3 border rounded-lg"
        />
        
        <button
          onClick={initiatePayment}
          disabled={loading || !paymentData.amount}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default PaymentComponent;`}
                          title="PaymentComponent.jsx"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-blue-700 mb-2">3. Handle Payment Callback</h5>
                        <CodeBlock 
                          code={`// pages/payment/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const PaymentCallback = () => {
  const router = useRouter();
  
  useEffect(() => {
    const { payment_id, status, amount } = router.query;
    
    if (status === 'success') {
      // Payment successful
      console.log('Payment successful:', { payment_id, amount });
      // Redirect to success page
      router.push('/payment/success');
    } else {
      // Payment failed
      console.log('Payment failed:', { payment_id, status });
      // Redirect to failure page
      router.push('/payment/failed');
    }
  }, [router.query]);

  return <div>Processing payment...</div>;
};

export default PaymentCallback;`}
                          title="PaymentCallback.jsx"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Node.js Integration */}
              {activeTab === 'nodejs' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <FaNodeJs className="text-green-600" />
                      Node.js Backend Integration
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-green-700 mb-2">1. Install Dependencies</h5>
                        <CodeBlock 
                          code={`npm install express axios crypto dotenv
# or
yarn add express axios crypto dotenv`}
                          title="Package Installation"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-green-700 mb-2">2. Environment Configuration</h5>
                        <CodeBlock 
                          code={`# .env file
CBI_API_SECRET=${truncate(keys.api_secret, 8, 8)}
CBI_API_HASH=${truncate(keys.api_hash, 8, 8)}
CBI_MERCHANT_ID=${keys.merchant_id}
CBI_GATEWAY_KEY=${truncate(keys.payment_gateway_key, 8, 8)}
CBI_BASE_URL=${getBaseUrl()}
CBI_ENVIRONMENT=${keys.environment}`}
                          title=".env"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-green-700 mb-2">3. Payment Service Implementation</h5>
                        <CodeBlock 
                          code={`// services/paymentService.js
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

class PaymentService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.CBI_BASE_URL,
      headers: {
        'Authorization': \`Bearer \${process.env.CBI_API_SECRET}\`,
        'Content-Type': 'application/json',
        'X-API-Hash': process.env.CBI_API_HASH,
        'X-Merchant-ID': process.env.CBI_MERCHANT_ID
      }
    });
  }

  // Generate payment signature for security
  generateSignature(data) {
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
      .map(key => \`\${key}=\${data[key]}\`)
      .join('&');
    
    return crypto
      .createHmac('sha256', process.env.CBI_API_SECRET)
      .update(signatureString)
      .digest('hex');
  }

  // Initiate payment
  async createPayment(paymentData) {
    try {
      const payload = {
        merchant_id: process.env.CBI_MERCHANT_ID,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        customer_email: paymentData.customer_email,
        customer_name: paymentData.customer_name,
        order_id: paymentData.order_id,
        callback_url: paymentData.callback_url,
        webhook_url: paymentData.webhook_url,
        timestamp: Date.now()
      };

      // Add signature for security
      payload.signature = this.generateSignature(payload);

      const response = await this.apiClient.post('/payments', payload);
      return response.data;
    } catch (error) {
      throw new Error(\`Payment creation failed: \${error.response?.data?.message || error.message}\`);
    }
  }

  // Verify payment status
  async verifyPayment(paymentId) {
    try {
      const response = await this.apiClient.get(\`/payments/\${paymentId}\`);
      return response.data;
    } catch (error) {
      throw new Error(\`Payment verification failed: \${error.response?.data?.message || error.message}\`);
    }
  }

  // Process refund
  async processRefund(paymentId, amount, reason) {
    try {
      const payload = {
        payment_id: paymentId,
        amount: amount,
        reason: reason,
        timestamp: Date.now()
      };

      payload.signature = this.generateSignature(payload);

      const response = await this.apiClient.post('/refunds', payload);
      return response.data;
    } catch (error) {
      throw new Error(\`Refund processing failed: \${error.response?.data?.message || error.message}\`);
    }
  }
}

module.exports = new PaymentService();`}
                          title="paymentService.js"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-green-700 mb-2">4. Express.js Route Implementation</h5>
                        <CodeBlock 
                          code={`// routes/payment.js
const express = require('express');
const paymentService = require('../services/paymentService');
const router = express.Router();

// Create payment
router.post('/create', async (req, res) => {
  try {
    const paymentData = {
      amount: req.body.amount,
      currency: req.body.currency,
      customer_email: req.body.customer_email,
      customer_name: req.body.customer_name,
      order_id: req.body.order_id,
      callback_url: req.body.callback_url,
      webhook_url: req.body.webhook_url
    };

    const payment = await paymentService.createPayment(paymentData);
    
    res.json({
      success: true,
      payment_id: payment.payment_id,
      payment_url: payment.payment_url,
      message: 'Payment created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Payment webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const { payment_id, status, amount, signature } = req.body;
    
    // Verify webhook signature
    const expectedSignature = paymentService.generateSignature({
      payment_id,
      status,
      amount
    });
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process webhook data
    console.log('Payment webhook received:', {
      payment_id,
      status,
      amount
    });

    // Update your database here
    // await updatePaymentStatus(payment_id, status);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.get('/verify/:paymentId', async (req, res) => {
  try {
    const payment = await paymentService.verifyPayment(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;`}
                          title="payment.js (Routes)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HTML/CSS Integration */}
              {activeTab === 'html' && (
                <div className="space-y-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                      <FaHtml5 className="text-orange-600" />
                      Simple HTML/CSS Integration
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-orange-700 mb-2">Complete HTML Payment Form</h5>
                        <CodeBlock 
                          code={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CBI Payment Gateway</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .payment-container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .payment-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .payment-header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #555;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .pay-button {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .pay-button:hover {
            transform: translateY(-2px);
        }
        
        .pay-button:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        
        .security-info {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
            color: #666;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="payment-container">
        <div class="payment-header">
            <h1>🏦 CBI Payment Gateway</h1>
            <p>Secure & Fast Payments</p>
        </div>
        
        <form id="paymentForm">
            <div class="form-group">
                <label for="amount">Amount (₹)</label>
                <input type="number" id="amount" name="amount" required min="1" step="0.01">
            </div>
            
            <div class="form-group">
                <label for="customerName">Customer Name</label>
                <input type="text" id="customerName" name="customerName" required>
            </div>
            
            <div class="form-group">
                <label for="customerEmail">Email Address</label>
                <input type="email" id="customerEmail" name="customerEmail" required>
            </div>
            
            <div class="form-group">
                <label for="customerPhone">Phone Number</label>
                <input type="tel" id="customerPhone" name="customerPhone" required>
            </div>
            
            <button type="submit" class="pay-button" id="payButton">
                🔒 Pay Securely
            </button>
        </form>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Processing your payment...</p>
        </div>
        
        <div class="security-info">
            🔐 Your payment is secured with bank-grade encryption
        </div>
    </div>

    <script>
        // Payment configuration
        const PAYMENT_CONFIG = {
            apiUrl: '${getBaseUrl()}',
            merchantId: '${keys.merchant_id}',
            apiSecret: '${truncate(keys.api_secret, 8, 8)}',
            apiHash: '${truncate(keys.api_hash, 8, 8)}'
        };

        document.getElementById('paymentForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const paymentData = {
                amount: parseFloat(formData.get('amount')),
                customer_name: formData.get('customerName'),
                customer_email: formData.get('customerEmail'),
                customer_phone: formData.get('customerPhone'),
                merchant_id: PAYMENT_CONFIG.merchantId,
                currency: 'INR',
                callback_url: window.location.origin + '/payment-callback.html',
                webhook_url: '${keys.webhook_config?.url || 'https://yoursite.com/webhook/payment'}'
            };
            
            // Show loading
            document.getElementById('payButton').disabled = true;
            document.getElementById('loading').style.display = 'block';
            
            try {
                const response = await fetch(PAYMENT_CONFIG.apiUrl + '/payments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + PAYMENT_CONFIG.apiSecret,
                        'X-API-Hash': PAYMENT_CONFIG.apiHash,
                        'X-Merchant-ID': PAYMENT_CONFIG.merchantId
                    },
                    body: JSON.stringify(paymentData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Redirect to payment gateway
                    window.location.href = result.payment_url;
                } else {
                    throw new Error(result.message || 'Payment initiation failed');
                }
            } catch (error) {
                alert('Payment failed: ' + error.message);
                document.getElementById('payButton').disabled = false;
                document.getElementById('loading').style.display = 'none';
            }
        });
    </script>
</body>
</html>`}
                          title="payment.html"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-orange-700 mb-2">Payment Callback Page</h5>
                        <CodeBlock 
                          code={`<!-- payment-callback.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Status - CBI Gateway</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .status-container {
            max-width: 400px;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .success {
            color: #28a745;
        }
        
        .failed {
            color: #dc3545;
        }
        
        .status-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        
        .continue-button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="status-container">
        <div id="paymentStatus">
            <div class="status-icon">⏳</div>
            <h2>Processing...</h2>
            <p>Please wait while we verify your payment</p>
        </div>
        
        <button class="continue-button" onclick="goHome()" style="display: none;" id="continueBtn">
            Continue Shopping
        </button>
    </div>

    <script>
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('payment_id');
        const status = urlParams.get('status');
        const amount = urlParams.get('amount');
        
        const statusContainer = document.getElementById('paymentStatus');
        const continueBtn = document.getElementById('continueBtn');
        
        if (status === 'success') {
            statusContainer.innerHTML = \`
                <div class="status-icon success">✅</div>
                <h2 class="success">Payment Successful!</h2>
                <p>Payment ID: <strong>\${paymentId}</strong></p>
                <p>Amount: <strong>₹\${amount}</strong></p>
                <p>Thank you for your payment!</p>
            \`;
        } else if (status === 'failed') {
            statusContainer.innerHTML = \`
                <div class="status-icon failed">❌</div>
                <h2 class="failed">Payment Failed</h2>
                <p>Payment ID: <strong>\${paymentId}</strong></p>
                <p>Please try again or contact support</p>
            \`;
        } else {
            statusContainer.innerHTML = \`
                <div class="status-icon">❓</div>
                <h2>Unknown Status</h2>
                <p>Please contact support for assistance</p>
            \`;
        }
        
        continueBtn.style.display = 'block';
        
        function goHome() {
            window.location.href = '/';
        }
    </script>
</body>
</html>`}
                          title="payment-callback.html"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vanilla JavaScript Integration */}
              {activeTab === 'javascript' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                      <FaJs className="text-yellow-600" />
                      Vanilla JavaScript SDK
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-yellow-700 mb-2">CBI Payment SDK</h5>
                        <CodeBlock 
                          code={`// cbi-payment-sdk.js
class CBIPaymentGateway {
    constructor(config) {
        this.config = {
            apiUrl: '${getBaseUrl()}',
            merchantId: '${keys.merchant_id}',
            apiSecret: '${truncate(keys.api_secret, 8, 8)}',
            apiHash: '${truncate(keys.api_hash, 8, 8)}',
            environment: '${keys.environment}',
            ...config
        };
    }

    // Generate unique order ID
    generateOrderId() {
        return 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Validate payment data
    validatePaymentData(data) {
        const required = ['amount', 'customer_name', 'customer_email'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(\`Missing required fields: \${missing.join(', ')}\`);
        }
        
        if (data.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(data.customer_email)) {
            throw new Error('Invalid email format');
        }
        
        return true;
    }

    // Create payment
    async createPayment(paymentData) {
        try {
            this.validatePaymentData(paymentData);
            
            const payload = {
                merchant_id: this.config.merchantId,
                order_id: paymentData.order_id || this.generateOrderId(),
                amount: parseFloat(paymentData.amount),
                currency: paymentData.currency || 'INR',
                customer_name: paymentData.customer_name,
                customer_email: paymentData.customer_email,
                customer_phone: paymentData.customer_phone,
                callback_url: paymentData.callback_url || window.location.origin + '/payment-callback',
                webhook_url: paymentData.webhook_url,
                description: paymentData.description || 'Payment',
                timestamp: Date.now()
            };

            const response = await fetch(this.config.apiUrl + '/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.config.apiSecret,
                    'X-API-Hash': this.config.apiHash,
                    'X-Merchant-ID': this.config.merchantId
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Payment creation failed');
            }

            return result;
        } catch (error) {
            console.error('Payment creation error:', error);
            throw error;
        }
    }

    // Verify payment
    async verifyPayment(paymentId) {
        try {
            const response = await fetch(\`\${this.config.apiUrl}/payments/\${paymentId}\`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.config.apiSecret,
                    'X-API-Hash': this.config.apiHash,
                    'X-Merchant-ID': this.config.merchantId
                }
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Payment verification failed');
            }

            return result;
        } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
        }
    }

    // Complete payment flow
    async processPayment(paymentData, options = {}) {
        try {
            const payment = await this.createPayment(paymentData);
            
            if (options.usePopup) {
                return new Promise((resolve, reject) => {
                    this.openPaymentPopup(
                        payment.payment_url,
                        resolve,
                        reject
                    );
                });
            } else {
                // Redirect to payment page
                window.location.href = payment.payment_url;
                return payment;
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    }
}

// Usage example
const paymentGateway = new CBIPaymentGateway();

// Simple payment function
async function makePayment(amount, customerData) {
    try {
        const result = await paymentGateway.processPayment({
            amount: amount,
            customer_name: customerData.name,
            customer_email: customerData.email,
            customer_phone: customerData.phone,
            description: 'Product purchase'
        });
        
        console.log('Payment initiated:', result);
    } catch (error) {
        console.error('Payment failed:', error);
        alert('Payment failed: ' + error.message);
    }
}`}
                          title="cbi-payment-sdk.js"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-yellow-700 mb-2">Implementation Example</h5>
                        <CodeBlock 
                          code={`<!DOCTYPE html>
<html>
<head>
    <title>CBI Payment Integration</title>
    <script src="cbi-payment-sdk.js"></script>
</head>
<body>
    <button onclick="startPayment()">Pay ₹100</button>
    <button onclick="startPaymentPopup()">Pay ₹100 (Popup)</button>

    <script>
        // Initialize payment gateway
        const cbiPayment = new CBIPaymentGateway();

        // Regular payment (redirect)
        function startPayment() {
            cbiPayment.processPayment({
                amount: 100,
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                customer_phone: '9876543210'
            });
        }

        // Popup payment
        async function startPaymentPopup() {
            try {
                const result = await cbiPayment.processPayment({
                    amount: 100,
                    customer_name: 'John Doe',
                    customer_email: 'john@example.com',
                    customer_phone: '9876543210'
                }, { usePopup: true });
                
                alert('Payment successful!');
            } catch (error) {
                alert('Payment failed: ' + error.message);
            }
        }
    </script>
</body>
</html>`}
                          title="example.html"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Reference Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📚 API Reference</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-semibold text-gray-700 mb-2">Base URLs</h5>
                    <div className="space-y-2 text-sm">
                      <div><strong>Test:</strong> <code>https://sandbox.cbibank.com/v1</code></div>
                      <div><strong>Live:</strong> <code>https://api.cbibank.com/v1</code></div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-semibold text-gray-700 mb-2">Authentication</h5>
                    <div className="space-y-2 text-sm">
                      <div><strong>Header:</strong> <code>Authorization: Bearer [API_SECRET]</code></div>
                      <div><strong>Hash:</strong> <code>X-API-Hash: [API_HASH]</code></div>
                      <div><strong>Merchant:</strong> <code>X-Merchant-ID: [MERCHANT_ID]</code></div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-semibold text-gray-700 mb-2">Rate Limits</h5>
                    <div className="space-y-2 text-sm">
                      <div><strong>Per Minute:</strong> {keys?.rate_limits?.requests_per_minute?.toLocaleString() || '1,000'} requests</div>
                      <div><strong>Per Day:</strong> {keys?.rate_limits?.requests_per_day?.toLocaleString() || '10,000'} requests</div>
                      <div><strong>Per Month:</strong> {keys?.rate_limits?.requests_per_month?.toLocaleString() || '300,000'} requests</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-semibold text-gray-700 mb-2">Response Codes</h5>
                    <div className="space-y-2 text-sm">
                      <div><strong>200:</strong> Success</div>
                      <div><strong>400:</strong> Bad Request</div>
                      <div><strong>401:</strong> Unauthorized</div>
                      <div><strong>429:</strong> Rate Limited</div>
                      <div><strong>500:</strong> Server Error</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download SDK Section */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-6">
                <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <FaDownload className="text-indigo-600" />
                  Download SDKs & Resources
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="#" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow">
                    <FaReact className="text-2xl text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-800">React SDK</div>
                      <div className="text-sm text-gray-600">NPM Package</div>
                    </div>
                  </a>
                  
                  <a href="#" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow">
                    <FaNodeJs className="text-2xl text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-800">Node.js SDK</div>
                      <div className="text-sm text-gray-600">NPM Package</div>
                    </div>
                  </a>
                  
                  <a href="#" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow">
                    <FaJs className="text-2xl text-yellow-600" />
                    <div>
                      <div className="font-semibold text-gray-800">JavaScript SDK</div>
                      <div className="text-sm text-gray-600">CDN / Download</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Support Links */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">🎯 Developer Support</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href="#" className="flex items-center gap-3 text-green-700 hover:text-green-800">
                    <FaBook />
                    <span>Complete API Documentation</span>
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                  
                  <a href="#" className="flex items-center gap-3 text-green-700 hover:text-green-800">
                    <FaCode />
                    <span>Code Examples & Tutorials</span>
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                  
                  <a href="#" className="flex items-center gap-3 text-green-700 hover:text-green-800">
                    <FaShieldAlt />
                    <span>Security Best Practices</span>
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                  
                  <a href="#" className="flex items-center gap-3 text-green-700 hover:text-green-800">
                    <FaCog />
                    <span>Developer Support Portal</span>
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <FaInfoCircle className="text-yellow-600 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No API Keys Found</h3>
            <p className="text-yellow-700 mb-4">Generate your API keys first to access the integration guide.</p>
            <a href="/api-keys" className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              <FaKey />
              Generate API Keys
            </a>
          </div>
        )}
      </div>
    </div>
  );
}