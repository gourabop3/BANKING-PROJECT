"use client";

import HeaderName from '@/components/HeaderName';
import React, { useEffect, useState } from 'react';
import MessageShow from './+___compoents/MessageShow';
import { toast } from 'react-toastify';
import { axiosClient } from '@/utils/AxiosClient';
import CustomLoader from '@/components/reuseable/CustomLoader';
import { FaHistory, FaFilter, FaDownload, FaSearch } from 'react-icons/fa';
import { MdAccountBalance, MdCreditCard, MdMobileScreenShare } from 'react-icons/md';
import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi';

const Transactions = () => {
  const [transaction, setTransaction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllTransaction = async () => {
    try {
      // Fetch regular transactions
      const transactionResponse = await axiosClient.get('/amount/transactions', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      // Fetch recharge history
      const rechargeResponse = await axiosClient.get('/recharge/history', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const regularTransactions = transactionResponse.data || [];
      const rechargeHistory = rechargeResponse.data?.history || [];

      // Transform recharge history to match transaction format
      const transformedRecharges = rechargeHistory.map(recharge => ({
        _id: recharge.transactionId,
        type: 'recharge',
        amount: recharge.amount,
        createdAt: recharge.date,
        isSuccess: recharge.status === 'success',
        remark: recharge.description || `${recharge.type} - ${recharge.mobileNumber || recharge.consumerNumber}`,
        rechargeType: recharge.type,
        rechargeDetails: {
          mobileNumber: recharge.mobileNumber,
          operator: recharge.operator,
          billType: recharge.billType,
          consumerNumber: recharge.consumerNumber
        }
      }));

      // Combine and sort by date (newest first)
      const allTransactions = [...regularTransactions, ...transformedRecharges]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTransaction(allTransactions);
    } catch (error) {
      toast.error(error?.response?.data?.msg || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = transaction;
    
    // Filter by tab
    switch (activeTab) {
      case 'deposits':
        filtered = transaction.filter(t => t.type === 'credit' || t.type === 'debit');
        break;
      case 'recharges':
        filtered = transaction.filter(t => t.type === 'recharge');
        break;
      default:
        filtered = transaction;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.remark.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getTransactionStats = () => {
    const filteredTxns = getFilteredTransactions();
    const totalCredit = filteredTxns
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = filteredTxns
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalTransactions: filteredTxns.length,
      totalCredit,
      totalDebit,
      netAmount: totalCredit - totalDebit
    };
  };

  const stats = getTransactionStats();

  useEffect(() => {
    fetchAllTransaction();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container py-6 md:py-10 px-4 md:px-6">
        <HeaderName />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
  <FaHistory className="text-blue-600 text-2xl md:text-3xl" />
</div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Transaction History</h1>
              <p className="text-blue-100">Track all your financial activities</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <MdAccountBalance className="text-lg text-blue-600" />
                <span className="text-sm text-gray-700">Total</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalTransactions}</div>
            </div>
            
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <BiTrendingUp className="text-lg text-green-600" />
                <span className="text-sm text-gray-700">Credit</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-green-600">₹{stats.totalCredit.toLocaleString()}</div>
            </div>
            
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <BiTrendingDown className="text-lg text-red-600" />
                <span className="text-sm text-gray-700">Debit</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-red-600">₹{stats.totalDebit.toLocaleString()}</div>
            </div>
            
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <MdCreditCard className="text-lg text-purple-600" />
                <span className="text-sm text-gray-700">Net</span>
              </div>
              <div className={`text-xl md:text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.netAmount >= 0 ? '+' : ''}₹{stats.netAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <MessageShow />

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1 flex-1 max-w-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MdAccountBalance className="text-lg" />
                All
              </button>
              <button
                onClick={() => setActiveTab('deposits')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'deposits'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MdCreditCard className="text-lg" />
                Banking
              </button>
              <button
                onClick={() => setActiveTab('recharges')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'recharges'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MdMobileScreenShare className="text-lg" />
                Recharges
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Download Button */}
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <FaDownload />
              Export
            </button>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <CustomLoader />
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredTransactions().length > 0 ? (
                getFilteredTransactions().map((transaction, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{transaction._id}</p>
                      <p className="text-sm text-gray-600">{transaction.remark}</p>
                      <p className="text-sm text-gray-600">Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className={`text-lg font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className={`text-sm ${transaction.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.isSuccess ? 'Success' : 'Failed'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="bg-gray-50 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <FaHistory className="text-4xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Transactions Found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms' : 'Your transactions will appear here'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;