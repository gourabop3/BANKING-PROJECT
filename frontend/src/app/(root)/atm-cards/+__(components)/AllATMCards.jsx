"use client";
import React, { useState } from "react";
import { useMainContext } from "@/context/MainContext";
import { FaEye, FaEyeSlash, FaCreditCard, FaShieldAlt, FaPlus } from "react-icons/fa";
import UseCardModel from "./UseCard";
import AddNewCard from "./AddNewCard";
import { generateAccountNumber, formatAccountNumber } from "@/utils/accountUtils";

const AllATMCards = () => {
  const { user } = useMainContext();
  const [visibleCVVs, setVisibleCVVs] = useState({});
  const [visibleCardDetails, setVisibleCardDetails] = useState({});

  const atms = Array.isArray(user?.atms) ? user.atms : [];
  const accountNos = Array.isArray(user?.account_no) ? user.account_no : [];
  
  // Debug logging
  console.log('User data:', user);
  console.log('ATMs data:', atms);
  console.log('Account numbers:', accountNos);

  const toggleCVV = (cardId) => {
    setVisibleCVVs((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const toggleCardDetails = (cardId) => {
    setVisibleCardDetails((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const getFormattedAccountNumber = (atmItem) => {
    if (!user) return atmItem.account;
    const accountObj = accountNos.find((acc) => acc._id === atmItem.account);
    if (!accountObj) return atmItem.account;
    const accNum = generateAccountNumber(user._id, accountObj._id, accountObj.ac_type);
    return formatAccountNumber(accNum);
  };

  const formatExpiry = (expiry) => {
    const date = new Date(expiry);
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  };

  const getCardTitle = (type) => {
    switch (type.toLowerCase()) {
      case "basic":
        return "Basic Card";
      case "classic":
        return "Classic Card";
      case "platinum":
        return "Platinum Card";
      default:
        return `${type} Card`;
    }
  };

  const getCardGradient = (type) => {
    switch (type.toLowerCase()) {
      case "basic":
        return "from-slate-800 via-slate-700 to-slate-600"; // Better contrast for basic
      case "classic":
        return "from-indigo-600 via-purple-600 to-pink-600"; // Vibrant and visible
      case "platinum":
        return "from-gray-500 via-gray-400 to-gray-300"; // Light platinum look
      default:
        return "from-blue-600 via-blue-700 to-blue-800"; // Default blue gradient
    }
  };

  const validAtms = atms.filter(
    (atm) => {
      console.log('Checking ATM:', atm);
      const cardNoValid = atm.card_no && atm.card_no.toString().length >= 15;
      console.log('Card number check:', atm.card_no, 'Length:', atm.card_no?.toString().length, 'Valid:', cardNoValid);
      const isValid = atm &&
        atm._id &&
        atm.card_type &&
        cardNoValid &&
        atm.cvv &&
        atm.expiry &&
        atm.account;
      console.log('ATM valid:', isValid);
      return isValid;
    }
  );
  
  console.log('Valid ATMs:', validAtms);

  // Temporarily show all ATMs if no valid ones exist
  const cardsToShow = validAtms.length > 0 ? validAtms : atms;
  
  if (!user || cardsToShow.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <FaCreditCard className="text-3xl text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No ATM Cards Yet</h3>
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            {!user
              ? "User data not available. Please log in."
              : atms.length === 0
              ? "You haven't created any ATM cards yet. Create your first card to start making secure transactions."
              : "Your ATM cards are being validated. Please check the console for more details."}
          </p>

          {user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaPlus className="text-2xl text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Add Your First Card</h4>
                <p className="text-sm text-gray-700 mb-4">Create a new ATM card for secure transactions</p>
                <AddNewCard />
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FaShieldAlt className="text-2xl text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure & Protected</h4>
                <p className="text-sm text-gray-700">Advanced encryption and fraud protection</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cardsToShow.map((atm) => {
        const isShowCVV = visibleCVVs[atm._id] || false;
        const isShowCardDetails = visibleCardDetails[atm._id] || false;

        return (
          <div key={atm._id} className="flex flex-col items-center group">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-800 font-medium">Account: {getFormattedAccountNumber(atm)}</p>
            </div>

            <div
              className={`relative w-full max-w-sm min-h-[12rem] rounded-2xl p-6 mb-6 overflow-hidden text-white shadow-2xl transform transition-all duration-300 hover:scale-105 bg-gradient-to-br ${getCardGradient(
                atm.card_type
              )}`}
            >
              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-0 rounded-2xl" />

              {/* Card content with improved contrast */}
              <div className="relative h-full flex flex-col justify-between z-10">
                <div className="text-center">
                  <h3 className="text-lg font-bold tracking-wide text-white drop-shadow-lg">
                    {getCardTitle(atm.card_type)}
                  </h3>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-mono font-bold tracking-widest text-white drop-shadow-lg">
                    {atm.card_no && atm.card_no.toString().length >= 16
                      ? `${atm.card_no.slice(0, 4)} **** **** ${atm.card_no.slice(12, 16)}`
                      : atm.card_no || "Card Number Not Available"}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <div className="text-xs text-white/90 mb-1 font-semibold drop-shadow">Cardholder</div>
                    <div className="font-medium text-xs uppercase truncate text-white drop-shadow">
                      {user?.name || "CARDHOLDER"}
                    </div>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="text-xs text-white/90 mb-1 font-semibold drop-shadow">CVV:</div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono font-bold text-white drop-shadow">
                        {isShowCVV ? atm.cvv : "xxx"}
                      </span>
                      <button
                        onClick={() => toggleCVV(atm._id)}
                        className="text-white/80 hover:text-white transition-colors ml-1 drop-shadow"
                        title={isShowCVV ? "Hide CVV" : "Show CVV"}
                      >
                        {isShowCVV ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="text-xs text-white/90 mb-1 font-semibold drop-shadow">Exp:</div>
                    <div className="font-mono font-bold text-white drop-shadow">
                      {formatExpiry(atm.expiry)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional shine effect for premium look */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </div>

            <div className="flex justify-center mb-4">
              <button
                onClick={() => toggleCardDetails(atm._id)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                {isShowCardDetails ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                {isShowCardDetails ? "Hide Card Details" : "View Card Details"}
              </button>
            </div>

            {isShowCardDetails && (
              <div className="w-full max-w-sm mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Card Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700 font-medium">Full Card Number:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      {atm.card_no && atm.card_no.toString().length >= 16 
                        ? `${atm.card_no.slice(0, 4)} ${atm.card_no.slice(4, 8)} ${atm.card_no.slice(8, 12)} ${atm.card_no.slice(12, 16)}`
                        : atm.card_no || "Card Number Not Available"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700 font-medium">CVV:</span>
                    <span className="font-mono font-semibold text-gray-900">{atm.cvv}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700 font-medium">Expiry Date:</span>
                    <span className="font-mono font-semibold text-gray-900">{formatExpiry(atm.expiry)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700 font-medium">Cardholder:</span>
                    <span className="font-semibold text-gray-900 uppercase">{user?.name || "CARDHOLDER"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-700 font-medium">Card Type:</span>
                    <span className="font-semibold text-gray-900 capitalize">{atm.card_type}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <UseCardModel type={atm.card_type} atmCard={atm} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllATMCards;