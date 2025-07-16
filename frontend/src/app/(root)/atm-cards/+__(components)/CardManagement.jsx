"use client";
import React, { useState } from 'react';
import { FaLock, FaUnlock, FaKey, FaCog, FaShieldAlt, FaTimes, FaCheck } from 'react-icons/fa';
import { MdBlock, MdEdit, MdSecurity } from 'react-icons/md';
import { toast } from 'react-toastify';
import { axiosClient } from '@/utils/AxiosClient';

const CardManagement = ({ card, onCardUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // PIN Change States
  const [pinChangeForm, setPinChangeForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });

  // Limit Settings States
  const [limitForm, setLimitForm] = useState({
    dailyLimit: card?.daily_limit || 50000,
    monthlyLimit: card?.monthly_limit || 200000,
    transactionLimit: card?.transaction_limit || 25000
  });

  // Block/Unblock functionality
  const handleBlockUnblock = async () => {
    setLoading(true);
    try {
      const action = card.status === 'active' ? 'block' : 'unblock';
      const response = await axiosClient.post(`/atm-card/${action}`, {
        cardId: card._id
      });
      
      toast.success(`Card ${action}ed successfully!`);
      onCardUpdate && onCardUpdate(card._id, { 
        ...card, 
        status: action === 'block' ? 'blocked' : 'active' 
      });
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || `Failed to ${card.status === 'active' ? 'block' : 'unblock'} card`);
    } finally {
      setLoading(false);
    }
  };

  // PIN Change functionality
  const handlePinChange = async (e) => {
    e.preventDefault();
    
    if (pinChangeForm.newPin !== pinChangeForm.confirmPin) {
      toast.error('New PIN and confirm PIN do not match');
      return;
    }
    
    if (pinChangeForm.newPin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/atm-card/change-pin', {
        cardId: card._id,
        currentPin: pinChangeForm.currentPin,
        newPin: pinChangeForm.newPin
      });
      
      toast.success('PIN changed successfully!');
      setPinChangeForm({ currentPin: '', newPin: '', confirmPin: '' });
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  // Limit Settings functionality
  const handleLimitUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosClient.post('/atm-card/update-limits', {
        cardId: card._id,
        ...limitForm
      });
      
      toast.success('Card limits updated successfully!');
      onCardUpdate && onCardUpdate(card._id, { ...card, ...limitForm });
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update limits');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (action) => {
    setActiveAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveAction(null);
    setPinChangeForm({ currentPin: '', newPin: '', confirmPin: '' });
  };

  return (
    <>
      {/* Management Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* Block/Unblock Button */}
        <button
          onClick={() => openModal('block')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            card.status === 'active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {card.status === 'active' ? <MdBlock /> : <FaUnlock />}
          {card.status === 'active' ? 'Block Card' : 'Unblock Card'}
        </button>

        {/* Change PIN Button */}
        <button
          onClick={() => openModal('pin')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <FaKey />
          Change PIN
        </button>

        {/* Set Limits Button */}
        <button
          onClick={() => openModal('limits')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <FaCog />
          Set Limits
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {activeAction === 'block' && (card.status === 'active' ? 'Block Card' : 'Unblock Card')}
                {activeAction === 'pin' && 'Change PIN'}
                {activeAction === 'limits' && 'Set Card Limits'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Block/Unblock Card */}
              {activeAction === 'block' && (
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    card.status === 'active' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {card.status === 'active' ? (
                      <MdBlock className="text-3xl text-red-600" />
                    ) : (
                      <FaUnlock className="text-3xl text-green-600" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-6">
                    {card.status === 'active' 
                      ? 'Are you sure you want to block this card? You won\'t be able to make transactions until you unblock it.'
                      : 'Are you sure you want to unblock this card? This will enable all transactions.'
                    }
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBlockUnblock}
                      disabled={loading}
                      className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                        card.status === 'active'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {loading ? 'Processing...' : (card.status === 'active' ? 'Block Card' : 'Unblock Card')}
                    </button>
                  </div>
                </div>
              )}

              {/* Change PIN */}
              {activeAction === 'pin' && (
                <form onSubmit={handlePinChange} className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <FaShieldAlt />
                    <span className="text-sm">Your PIN is encrypted and secure</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinChangeForm.currentPin}
                      onChange={(e) => setPinChangeForm(prev => ({ ...prev, currentPin: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current PIN"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinChangeForm.newPin}
                      onChange={(e) => setPinChangeForm(prev => ({ ...prev, newPin: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new 4-digit PIN"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinChangeForm.confirmPin}
                      onChange={(e) => setPinChangeForm(prev => ({ ...prev, confirmPin: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new PIN"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Changing...' : 'Change PIN'}
                    </button>
                  </div>
                </form>
              )}

              {/* Set Limits */}
              {activeAction === 'limits' && (
                <form onSubmit={handleLimitUpdate} className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-4">
                    <MdSecurity />
                    <span className="text-sm">Set transaction limits for enhanced security</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Limit (₹)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={100000}
                      value={limitForm.dailyLimit}
                      onChange={(e) => setLimitForm(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum amount you can withdraw per day</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Limit (₹)
                    </label>
                    <input
                      type="number"
                      min={10000}
                      max={500000}
                      value={limitForm.monthlyLimit}
                      onChange={(e) => setLimitForm(prev => ({ ...prev, monthlyLimit: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum amount you can withdraw per month</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Transaction Limit (₹)
                    </label>
                    <input
                      type="number"
                      min={500}
                      max={50000}
                      value={limitForm.transactionLimit}
                      onChange={(e) => setLimitForm(prev => ({ ...prev, transactionLimit: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum amount per single transaction</p>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Limits'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardManagement;