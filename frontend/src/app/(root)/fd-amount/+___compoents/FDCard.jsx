"use client";
import Link from 'next/link';
import React, { useState } from 'react'
import { FaEye, FaEyeSlash, FaCoins, FaCalendarAlt, FaPercentage } from 'react-icons/fa'; 
import { MdTrendingUp } from 'react-icons/md';
import ClaimFDModel from './ClaimFDModel';
import moment from 'moment';

const FDCard = ({data, isUpdate, setIsUpdate}) => {
    const [isShow, setIsShow] = useState(false)

    // Safely access data properties with fallbacks
    if (!data) {
        return (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
                <div className="text-center text-gray-500">Loading...</div>
            </div>
        );
    }

    const amount = `${data.amount || 0}`
    const applyFor = data.apply_for || 'Fixed Deposit'
    const isActive = !data.isClaimed
    const depositDate = data.date ? moment(data.date) : moment()
    const daysSinceDeposit = moment().diff(depositDate, 'days')

    const getStatusColor = () => {
        return isActive ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-cyan-500';
    }

    const getStatusBadge = () => {
        return isActive 
            ? { color: 'bg-green-100 text-green-800', text: 'Active' }
            : { color: 'bg-blue-100 text-blue-800', text: 'Claimed' };
    }

    const statusBadge = getStatusBadge();

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`h-2 bg-gradient-to-r ${getStatusColor()}`}></div>
            
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-3 rounded-xl">
                            <FaCoins className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-800">
                                {applyFor}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                                {statusBadge.text}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-2">Deposit Amount</p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl md:text-3xl font-bold text-gray-800">
                            ₹{isShow ? parseInt(amount).toLocaleString() : '••••••'}
                        </span>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsShow(!isShow)
                            }}
                            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                        >
                            {!isShow ? <FaEye className="text-gray-600" /> : <FaEyeSlash className="text-gray-600" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <FaPercentage className="text-green-600 text-sm" />
                            <span className="text-xs text-gray-600">Daily Interest Rate</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                            0.1%
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <FaCalendarAlt className="text-blue-600 text-sm" />
                            <span className="text-xs text-gray-600">Days Active</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                            {daysSinceDeposit} days
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Deposit Date</span>
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                        {depositDate.format('MMMM DD, YYYY')}
                    </div>
                </div>

                {isActive && (
                    <div className="flex justify-end">
                        <ClaimFDModel methods={{isUpdate, setIsUpdate}} id={data?._id} />
                    </div>
                )}

                {!isActive && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 text-sm">This Fixed Deposit has been claimed</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FDCard