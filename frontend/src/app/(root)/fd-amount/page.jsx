"use client";
import HeaderName from '@/components/HeaderName'
import React, { Suspense, useEffect, useState } from 'react'
import { FaCoins, FaCalendarAlt, FaPlus, FaTimes } from 'react-icons/fa'
import { MdSavings, MdTrendingUp } from 'react-icons/md'

import FDCard from './+___compoents/FDCard'
import { axiosClient } from '@/utils/AxiosClient'
import CustomLoader from '@/components/reuseable/CustomLoader'
import { toast } from 'react-toastify';
import { useMainContext } from '@/context/MainContext'

const FDPage = () => {
  const { user } = useMainContext();
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUpdate, setIsUpdate] = useState(false)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [accounts, setAccounts] = useState([])

  const fetchAllDeposits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error('Please login to continue')
        setDeposits([])
        return
      }

      const response = await axiosClient.get('/fd/get-all', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      
      const data = response.data || []
      
      if (Array.isArray(data)) {
        setDeposits(data)
      } else {
        setDeposits([])
      }

    } catch (error) {
      const errorMessage = error?.response?.data?.msg || error?.message || 'Failed to fetch fixed deposits'
      toast.error(errorMessage)
      setError(errorMessage)
      setDeposits([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setDeposits([]);
      setError('Please login to view your fixed deposits.');
      return;
    }
    fetchAllDeposits();
    // Set accounts from user data
    if (user?.account_no) {
      setAccounts(user.account_no);
    }
  }, [isUpdate, user]);

  const calculateStats = () => {
    try {
      if (!Array.isArray(deposits) || deposits.length === 0) {
        return {
          totalFDAmount: 0,
          activeFDs: 0,
          totalDeposits: 0
        }
      }

      const totalFDAmount = deposits.reduce((total, deposit) => {
        const amount = deposit?.amount || 0
        return total + (typeof amount === 'number' ? amount : 0)
      }, 0)

      const activeFDs = deposits.filter(deposit => 
        deposit && !deposit.isClaimed
      ).length

      return {
        totalFDAmount,
        activeFDs,
        totalDeposits: deposits.length
      }
    } catch (error) {
      return {
        totalFDAmount: 0,
        activeFDs: 0,
        totalDeposits: 0
      }
    }
  }

  const stats = calculateStats()

  if (!user) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50">
        <CustomLoader/>
        <p className="mt-4 text-lg text-gray-600">Please login to view your fixed deposits.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50">
        <CustomLoader/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container py-6 md:py-10 px-4 md:px-6">
        <HeaderName/>

        {/* Header with Create FD Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCoins className="text-green-600" />
            Your Fixed Deposits
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <FaPlus className="text-sm" />
            Create New FD
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaCoins className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">
                Unable to Load Fixed Deposits
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchAllDeposits}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* FD Cards Grid */}
        {!error && (
          <div className="mb-8">
            {deposits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <Suspense fallback={<CustomLoader/>}>
                  {deposits.map((deposit, index) => {
                    if (!deposit || !deposit._id) return null;
                    return (
                      <FDCard 
                        key={deposit._id} 
                        isUpdate={isUpdate} 
                        setIsUpdate={setIsUpdate} 
                        data={deposit} 
                      />
                    )
                  })}
                </Suspense>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <FaCoins className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Fixed Deposits Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Start your investment journey by creating your first fixed deposit using the "Create New FD" button above
                </p>
              </div>
            )}
          </div>
        )}

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <MdTrendingUp className="text-2xl text-green-600" />,
              title: "Guaranteed Returns",
              description: "Earn fixed daily interest rate of 0.1% with assured returns"
            },
            {
              icon: <FaCalendarAlt className="text-2xl text-blue-600" />,
              title: "Flexible Claim",
              description: "Claim your FD anytime with accumulated interest calculated daily"
            },
            {
              icon: <MdSavings className="text-2xl text-purple-600" />,
              title: "Compound Growth",
              description: "Watch your money grow with daily compounding interest"
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="bg-gray-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create FD Modal */}
      {showCreateModal && (
        <CreateFDModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          accounts={accounts}
          onFDCreated={() => {
            setIsUpdate(!isUpdate);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  )
}

// Create FD Modal Component
const CreateFDModal = ({ isOpen, onClose, accounts, onFDCreated }) => {
  const [formData, setFormData] = useState({
    amount: '',
    apply_for: '',
    account: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.apply_for || !formData.account) {
      toast.error('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axiosClient.post('/fd/add-new', {
        amount: parseFloat(formData.amount),
        apply_for: formData.apply_for,
        account: formData.account
      }, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      toast.success('Fixed Deposit created successfully!');
      onFDCreated();
      
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || error?.message || 'Failed to create fixed deposit';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaCoins className="text-green-600" />
            Create Fixed Deposit
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account <span className="text-red-500">*</span>
            </label>
            <select
              name="account"
              value={formData.account}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Choose an account</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.ac_type.charAt(0).toUpperCase() + account.ac_type.slice(1)} Account - ₹{account.amount}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount to deposit"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose/Duration <span className="text-red-500">*</span>
            </label>
            <select
              name="apply_for"
              value={formData.apply_for}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select purpose</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
              <option value="3 years">3 Years</option>
              <option value="5 years">5 Years</option>
            </select>
          </div>

          {/* Interest Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Interest Details</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Daily interest rate: 0.1%</li>
              <li>• Interest calculated daily</li>
              <li>• Claim anytime with accrued interest</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create FD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FDPage