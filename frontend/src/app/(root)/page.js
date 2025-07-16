"use client";
import { BsCoin } from "react-icons/bs";
import { RiCoinsLine } from "react-icons/ri";
import { IoCardSharp } from "react-icons/io5";
import { FaUniversity, FaUser, FaCreditCard, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { MdContentCopy, MdTrendingUp, MdNotifications } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiWallet, BiTransfer } from "react-icons/bi";
import Link from "next/link";
import HeaderName from "@/components/HeaderName";
import { useMainContext } from "@/context/MainContext";
import { FaEye,FaEyeSlash } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { toast } from 'react-toastify';
import { generateAccountNumber, generateIFSCCode, formatAccountNumber, getAccountTypeDisplayName, maskAccountNumber } from '@/utils/accountUtils';
import Card from '@/components/ui/Card';
import { useRouter } from "next/navigation";

// Animated counter hook
const useAnimatedCounter = (end, duration = 2000) => {
  const [current, setCurrent] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    if (counterRef.current) {
      cancelAnimationFrame(counterRef.current);
    }

    const startTime = Date.now();
    const startValue = 0; // Always start from 0
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuint = 1 - Math.pow(1 - progress, 5);
      const value = Math.floor(startValue + (end - startValue) * easeOutQuint);
      
      setCurrent(value);
      
      if (progress < 1) {
        counterRef.current = requestAnimationFrame(animate);
      }
    };
    
    counterRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (counterRef.current) {
        cancelAnimationFrame(counterRef.current);
      }
    };
  }, [end, duration]); // Removed 'current' from dependencies

  return current;
};

const HomePage=()=>{
  const {user} = useMainContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="text-6xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-700 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalAmount = user.account_no.map((cur)=>cur.amount).reduce((pre,cur)=>pre+cur);
  const dashboard_data = [
    {
      title:"Total Balance",
      "Icon":<BsCoin className="text-6xl text-yellow-500" />,
      "value": totalAmount,
      "prefix": "₹",
      link:'/amount',
      "trend": "+12.5%",
      "trendUp": true,
      "color": "from-yellow-400 to-orange-500"
    },
    {
      title:"FD Amount",
      "Icon":<RiCoinsLine className="text-6xl text-rose-700" /> ,
      "value": user.fd_amount,
      "prefix": "₹",
      link:"/fd-amount",
      "trend": "+8.2%",
      "trendUp": true,
      "color": "from-rose-400 to-pink-500"
    },
    {
      title:"ATM Cards",
      "Icon":<IoCardSharp className="text-6xl text-blue-600" />,
      "value": user?.atms?.length ?? 0,
      "prefix": "",
      link:'/atm-cards',
      "trend": "Active",
      "trendUp": true,
      "color": "from-blue-400 to-indigo-500"
    }
  ];

  const quickActions = [
    { title: "Transfer Money", icon: BiTransfer, link: "/transfer", color: "bg-green-500 hover:bg-green-600" },
    { title: "Recharge", icon: BiWallet, link: "/recharge", color: "bg-purple-500 hover:bg-purple-600" },
    { title: "Transactions", icon: FaChartLine, link: "/transactions", color: "bg-blue-500 hover:bg-blue-600" },
    { title: "Profile", icon: FaUser, link: "/profile", color: "bg-orange-500 hover:bg-orange-600" }
  ];

  // Get real user transactions or show appropriate message
  const getRecentTransactions = () => {
    // Check if user has transaction history
    if (user?.transactions && user.transactions.length > 0) {
      // Use real transaction data - get latest 3 transactions
      return user.transactions
        .slice(-3) // Get last 3 transactions
        .reverse() // Show newest first
        .map(transaction => ({
          type: transaction.txn_type === 'credit' ? 'Credit' : 'Debit',
          amount: `₹${transaction.amount?.toLocaleString() || '0'}`,
          desc: transaction.description || transaction.txn_type || 'Transaction',
          time: transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Recent',
          icon: transaction.txn_type === 'credit' ? FaArrowUp : FaArrowDown,
          color: transaction.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'
        }));
    }
    
    // If no transaction history, return empty array or placeholder message
    return [];
  };

  const recentTransactions = getRecentTransactions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 py-10 flex flex-col gap-y-6 px-4">
        {/* Header with real-time clock */}
        <div className="flex items-center justify-between">
          <HeaderName/>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Time</p>
            <p className="text-lg font-semibold text-gray-800">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
              <p className="text-blue-100">Here&apos;s your financial overview for today</p>
            </div>
            <MdTrendingUp className="text-4xl animate-bounce" />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {dashboard_data.map((cur, i) => (
            <DashboardCard data={cur} key={i} index={i} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <MdTrendingUp className="text-white" />
            </div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className={`${action.color} text-white p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg group`}
              >
                <action.icon className="text-2xl mx-auto mb-2 group-hover:animate-bounce" />
                <p className="font-medium text-sm">{action.title}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white" />
            </div>
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-102"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-white shadow-sm ${transaction.color}`}>
                      <transaction.icon className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{transaction.desc}</p>
                      <p className="text-sm text-gray-500">{transaction.time}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${transaction.color}`}>{transaction.amount}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No Recent Transactions</p>
                <p className="text-gray-400 text-sm mt-1">Your transaction history will appear here</p>
                <Link
                  href="/transactions"
                  className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  View All Transactions
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Banking Details Section */}
        <BankingDetailsCard user={user} />

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {isFloatingOpen && (
              <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-2 space-y-2 animate-in slide-in-from-bottom duration-300">
                <Link href="/customer-service" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <MdNotifications className="text-blue-600" />
                  <span className="text-sm whitespace-nowrap">Customer Service</span>
                </Link>
                <Link href="/transfer" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <BiTransfer className="text-green-600" />
                  <span className="text-sm whitespace-nowrap">Quick Transfer</span>
                </Link>
              </div>
            )}
            <button
              onClick={() => setIsFloatingOpen(!isFloatingOpen)}
              className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
            >
              <span className={`text-2xl transition-transform duration-300 ${isFloatingOpen ? 'rotate-45' : ''}`}>
                +
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-xl max-w-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdNotifications className="text-xl" />
                  <div>
                    <p className="font-semibold">System Alert</p>
                    <p className="text-sm text-green-100">Your account is secure and active!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-green-100 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage

const DashboardCard = ({data, index})=>{
  const [isShow,setIsShow] = useState(true); // Show values by default
  const [isHovered, setIsHovered] = useState(false);
  
  // Animated counter for numeric values
  const numericValue = typeof data.value === 'number' ? data.value : (parseInt(data.value) || 0);
  const animatedValue = useAnimatedCounter(isShow ? numericValue : 0, 1500);

  // Improved display logic
  const getDisplayValue = () => {
    if (!isShow) {
      // Create masked version
      const valueStr = data.value?.toString() || '0';
      return 'x'.repeat(Math.max(valueStr.length, 3));
    }
    
    // Show actual value
    if (typeof data.value === 'number') {
      return `${data.prefix || ''}${animatedValue.toLocaleString()}`;
    } else {
      return `${data.prefix || ''}${data.value || 'N/A'}`;
    }
  };

  const displayValue = getDisplayValue();

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 group ${
        isHovered ? 'shadow-2xl' : 'shadow-lg'
      }`}
      style={{animationDelay: `${index * 200}ms`}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-90`}></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-2 border-white rounded-full animate-ping"></div>
      </div>

      <Link href={data.link} className="relative z-10 block p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
            {data.Icon}
          </div>
          <div className="flex items-center gap-2">
            {data.trendUp ? (
              <FaArrowUp className="text-sm" />
            ) : (
              <FaArrowDown className="text-sm" />
            )}
            <span className="text-sm font-medium">{data.trend}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-white/90">{data.title}</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold">
              {displayValue}
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsShow(!isShow);
              }}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm"
            >
              {isShow ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-white/60 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: isShow ? '100%' : '0%',
              animationDelay: `${index * 300}ms`
            }}
          ></div>
        </div>

        {/* Hover effect overlay */}
        <div className={`absolute inset-0 bg-white/10 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
      </Link>

      {/* Floating particles effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

const BankingDetailsCard = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  
  // Use the utility functions for consistent account number generation
  const primaryAccount = user?.account_no?.[0];
  const accountNumber = (primaryAccount && user?._id) ? generateAccountNumber(user._id, primaryAccount._id, primaryAccount.ac_type) : "";
  const formattedAccountNumber = user?.kyc_status === 'verified'
    ? formatAccountNumber(accountNumber)
    : maskAccountNumber(accountNumber);
  
  const bankingInfo = {
    accountNumber: user?.kyc_status === 'verified' ? accountNumber : '',
    formattedAccountNumber: formattedAccountNumber,
    ifscCode: generateIFSCCode(),
    branchName: "Central Bank of India - Main Branch",
    branchCode: "001234",
    accountType: primaryAccount ? getAccountTypeDisplayName(primaryAccount.ac_type) : "Savings Account"
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
      setCopiedField(label);
      setTimeout(() => setCopiedField(''), 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <FaUniversity className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Banking Details</h2>
            <p className="text-gray-600">Secure account information</p>
          </div>
        </div>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {showDetails ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && (
        <div className="space-y-4 animate-in slide-in-from-top duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Account Holder Name */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors duration-300 group hover:shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <FaUser className="text-indigo-600" />
                </div>
                <span className="font-semibold text-gray-700">Account Holder</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">{user?.name || 'N/A'}</span>
                <button
                  onClick={() => copyToClipboard(user?.name || '', 'Account Holder Name')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copiedField === 'Account Holder Name' 
                      ? 'bg-green-100 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MdContentCopy />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Primary Account Holder</p>
            </div>

            {/* Account Type */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors duration-300 group hover:shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FaUser className="text-green-600" />
                </div>
                <span className="font-semibold text-gray-700">Account Type</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-gray-800">{bankingInfo.accountType}</span>
                <button
                  onClick={() => copyToClipboard(bankingInfo.accountType, 'Account Type')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copiedField === 'Account Type' 
                      ? 'bg-green-100 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MdContentCopy />
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors duration-300 group hover:shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FaCreditCard className="text-blue-600" />
                </div>
                <span className="font-semibold text-gray-700">Account Number</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-gray-800">{bankingInfo.formattedAccountNumber}</span>
                <button
                  onClick={() => copyToClipboard(bankingInfo.accountNumber, 'Account Number')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copiedField === 'Account Number' 
                      ? 'bg-green-100 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MdContentCopy />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{bankingInfo.accountType}</p>
            </div>

            {/* IFSC Code */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-colors duration-300 group hover:shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FaUniversity className="text-purple-600" />
                </div>
                <span className="font-semibold text-gray-700">IFSC Code</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-gray-800">{bankingInfo.ifscCode}</span>
                <button
                  onClick={() => copyToClipboard(bankingInfo.ifscCode, 'IFSC Code')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copiedField === 'IFSC Code' 
                      ? 'bg-green-100 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MdContentCopy />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Branch: {bankingInfo.branchCode}</p>
            </div>
          </div>

          {/* Branch Information */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 animate-in fade-in-50 duration-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaUniversity className="text-orange-600" />
              </div>
              <span className="font-semibold text-gray-700">Branch Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700 font-medium">{bankingInfo.branchName}</p>
                <p className="text-sm text-gray-500">Branch Code: {bankingInfo.branchCode}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Use these details for fund transfers, NEFT, RTGS
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  All details are verified and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};