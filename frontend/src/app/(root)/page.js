import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FaCoins, 
  FaPiggyBank, 
  FaCreditCard, 
  FaExchangeAlt, 
  FaMobileAlt, 
  FaChartLine, 
  FaUser, 
  FaArrowUp, 
  FaArrowDown,
  FaUserCircle,
  FaChartPie,
  FaUniversity,
  FaHistory,
  FaBolt,
  FaShieldAlt,
  FaCopy,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { MdContentCopy, MdTrendingUp, MdNotifications } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiWallet, BiTransfer } from "react-icons/bi";
import { BsCoin } from "react-icons/bs";
import { RiCoinsLine } from "react-icons/ri";
import { IoCardSharp } from "react-icons/io5";
import { useToast } from "@/hooks/use-toast";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import HeaderName from "@/components/HeaderName";
import BankingDetailsCard from "@/components/BankingDetailsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    kyc_status: string;
    fd_amount: string;
  };
  accounts: Array<{
    id: number;
    account_type: string;
    balance: string;
    account_number: string;
    ifsc_code: string;
  }>;
  transactions: Array<{
    id: number;
    transaction_type: string;
    amount: string;
    description: string;
    created_at: string;
  }>;
  atmCards: Array<{
    id: number;
    card_number: string;
    card_type: string;
    expiry_date: string;
    is_active: boolean;
  }>;
  totalBalance: string;
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const { toast } = useToast();

  // Mock user ID for demo purposes
  const userId = 1;

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard', userId],
    enabled: !!userId,
  });

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

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} clicked`,
      description: "This feature will be implemented soon.",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="text-6xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-700 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
              <p className="text-gray-600">Unable to load your banking data. Please try again.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data Found</h1>
              <p className="text-gray-600">Unable to find your banking information.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Total Balance",
      value: parseFloat(dashboardData.totalBalance),
      prefix: "₹",
      icon: <FaCoins className="text-2xl" />,
      trend: "+12.5%",
      trendUp: true,
      color: "from-yellow-400 to-orange-500",
      onClick: () => handleQuickAction("View Balance Details")
    },
    {
      title: "FD Amount",
      value: parseFloat(dashboardData.user.fd_amount),
      prefix: "₹",
      icon: <FaPiggyBank className="text-2xl" />,
      trend: "+8.2%",
      trendUp: true,
      color: "from-rose-400 to-pink-500",
      onClick: () => handleQuickAction("View FD Details")
    },
    {
      title: "ATM Cards",
      value: dashboardData.atmCards.length,
      icon: <FaCreditCard className="text-2xl" />,
      trend: "Active",
      trendUp: true,
      color: "from-blue-400 to-indigo-500",
      onClick: () => handleQuickAction("Manage ATM Cards")
    }
  ];

  const quickActions = [
    { title: "Transfer Money", icon: FaExchangeAlt, color: "bg-green-500 hover:bg-green-600" },
    { title: "Recharge", icon: FaMobileAlt, color: "bg-purple-500 hover:bg-purple-600" },
    { title: "Transactions", icon: FaChartLine, color: "bg-blue-500 hover:bg-blue-600" },
    { title: "Profile", icon: FaUser, color: "bg-orange-500 hover:bg-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft" style={{animationDelay: '4s'}}></div>
      </div>

      <Header userName={dashboardData.user.name} onLogout={handleLogout} />

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Account Status Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg animate-fade-in">
            <div className="flex items-center justify-center space-x-2">
              <FaShieldAlt className="text-lg" />
              <span className="font-medium">Your account is secure and active</span>
              <FaShieldAlt className="text-lg" />
            </div>
          </div>

          {/* Bank Header Info */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FaUniversity className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Central Bank of India</h1>
                  <p className="text-gray-600">Digital Banking Dashboard</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Current Time</p>
                <p className="text-lg font-semibold text-gray-800">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {dashboardData.user.name}! 👋</h2>
                <p className="text-blue-100 text-sm sm:text-base">Here's your financial overview for today</p>
              </div>
              <div className="hidden sm:block">
                <FaChartLine className="text-4xl animate-bounce-subtle" />
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up animate-delay-200">
            {dashboardCards.map((card, index) => (
              <DashboardCard key={index} {...card} index={index} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 animate-slide-up animate-delay-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaBolt className="text-white text-sm" />
              </div>
              <span>Quick Actions</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.title)}
                  className={`${action.color} text-white p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg group focus:outline-none focus:ring-4 focus:ring-opacity-50`}
                >
                  <action.icon className="text-2xl mx-auto mb-2 group-hover:animate-bounce-subtle" />
                  <p className="font-medium text-sm">{action.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 animate-slide-up animate-delay-400">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <FaHistory className="text-white text-sm" />
              </div>
              <span>Recent Transactions</span>
            </h3>
            
            <div className="space-y-4">
              {dashboardData.transactions.length > 0 ? (
                dashboardData.transactions.slice(0, 3).map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full bg-white shadow-sm ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'credit' ? (
                          <FaArrowUp className="text-lg" />
                        ) : (
                          <FaArrowDown className="text-lg" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${
                      transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'credit' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaChartLine className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No Recent Transactions</p>
                  <p className="text-gray-400 text-sm mt-1">Your transaction history will appear here</p>
                </div>
              )}
            </div>

            {/* View All Button */}
            <div className="mt-6 text-center">
              <Button 
                onClick={() => handleQuickAction("View All Transactions")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                View All Transactions
              </Button>
            </div>
          </div>

          {/* Banking Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up animate-delay-500">
            {/* Account Details */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <FaUserCircle className="text-white text-sm" />
                  </div>
                  <span>Account Details</span>
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setShowBankingDetails(!showBankingDetails)}
                  className="flex items-center space-x-2"
                >
                  {showBankingDetails ? <FaEyeSlash /> : <FaEye />}
                  <span>{showBankingDetails ? 'Hide' : 'Show'}</span>
                </Button>
              </div>

              {showBankingDetails && (
                <div className="space-y-4 animate-slide-up">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Account Holder</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{dashboardData.user.name}</span>
                      <button
                        onClick={() => copyToClipboard(dashboardData.user.name, "Account Holder Name")}
                        className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        <FaCopy className="text-sm" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Account Number</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{dashboardData.accounts[0]?.account_number}</span>
                      <button
                        onClick={() => copyToClipboard(dashboardData.accounts[0]?.account_number, "Account Number")}
                        className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        <FaCopy className="text-sm" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">IFSC Code</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{dashboardData.accounts[0]?.ifsc_code}</span>
                      <button
                        onClick={() => copyToClipboard(dashboardData.accounts[0]?.ifsc_code, "IFSC Code")}
                        className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        <FaCopy className="text-sm" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Branch</span>
                    <span className="font-semibold text-gray-800">Mumbai Central</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <FaChartPie className="text-white text-sm" />
                </div>
                <span>Quick Stats</span>
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Monthly Income</p>
                      <p className="text-2xl font-bold text-green-700">₹75,000</p>
                    </div>
                    <FaArrowUp className="text-green-500 text-2xl" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Monthly Expenses</p>
                      <p className="text-2xl font-bold text-blue-700">₹25,000</p>
                    </div>
                    <FaArrowDown className="text-blue-500 text-2xl" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Savings Rate</p>
                      <p className="text-2xl font-bold text-purple-700">67%</p>
                    </div>
                    <span className="text-purple-500 text-2xl">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Notification Toast */}
      <NotificationToast
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
