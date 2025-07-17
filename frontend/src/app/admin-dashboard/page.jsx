"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  FaSignOutAlt, 
  FaTachometerAlt, 
  FaUser, 
  FaIdCard, 
  FaMoneyBill, 
  FaPercent,
  FaChartBar,
  FaCreditCard,
  FaUsers,
  FaCog,
  FaBox,
  FaBell,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaEnvelope,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheck,
  FaPlus,
  FaFilter,
  FaDownload,
  FaUserCheck,
  FaUserTimes,
  FaInfoCircle,
  FaHistory,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaDollarSign,
  FaChevronDown,
  FaChevronUp,
  FaPaperPlane,
  FaUserCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import { MdDashboard, MdNotifications, MdSettings, MdEmail, MdVerified, MdPending, MdCancel } from 'react-icons/md';
import { axiosClient } from '@/utils/AxiosClient';
import dynamic from 'next/dynamic';

// Dynamically import ProductManagement to avoid SSR issues
const ProductManagement = dynamic(() => import('./products/page'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading products...</span>
  </div>
});

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [kycPending, setKycPending] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [addingDiscount, setAddingDiscount] = useState(false);
  
  // New states for enhanced features
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [activeUserTab, setActiveUserTab] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [emailModal, setEmailModal] = useState({ open: false, user: null });
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingKYC: 0,
    totalTransactions: 0,
    totalAmount: 0,
    recentTransactions: 0
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminToken = localStorage.getItem('admin_token');
        if (!adminToken) {
          router.push('/admin-login');
          return;
        }

        // Test token validity by making a request to admin stats
        const response = await axiosClient.get('/admin/stats');
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('admin_token');
        router.push('/admin-login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (tab === 'dashboard') {
      fetchDashboardStats();
    } else if (tab === 'users') {
      fetchUsers();
    } else if (tab === 'products') {
      // Products are handled by the separate page component
    } else if (tab === 'kyc') {
      fetchKYCPending();
    } else if (tab === 'transactions') {
      fetchTransactions();
    } else if (tab === 'discounts') {
      fetchDiscounts();
    }
  }, [tab, isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all data in parallel for dashboard
      const [usersRes, kycRes, txnRes] = await Promise.all([
        axiosClient.get('/admin/users'),
        axiosClient.get('/admin/kyc/pending'),
        axiosClient.get('/admin/transactions')
      ]);

      const usersData = usersRes.data.data || [];
      const kycData = kycRes.data.data || [];
      const txnData = txnRes.data.data || [];

      const totalAmount = txnData.reduce((sum, txn) => sum + (txn.amount || 0), 0);
      const recentTransactions = txnData.filter(txn => {
        const txnDate = new Date(txn.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return txnDate >= weekAgo;
      }).length;

      setStats({
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.isActive).length,
        pendingKYC: kycData.length,
        totalTransactions: txnData.length,
        totalAmount: totalAmount,
        recentTransactions: recentTransactions
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await axiosClient.get('/admin/users');
      
      if (response.data.success) {
        // Fetch additional data for each user
        const usersWithDetails = await Promise.all(
          response.data.data.map(async (user) => {
            try {
              // Fetch user profile and recent transactions
              const [profileRes, txnRes] = await Promise.all([
                axiosClient.get(`/admin/user/${user._id}/profile`).catch(() => ({ data: { data: null } })),
                axiosClient.get(`/admin/user/${user._id}/transactions`).catch(() => ({ data: { data: [] } }))
              ]);

              return {
                ...user,
                profile: profileRes.data.data,
                recentTransactions: txnRes.data.data || []
              };
            } catch (error) {
              console.error(`Error fetching details for user ${user._id}:`, error);
              return { ...user, profile: null, recentTransactions: [] };
            }
          })
        );

        setUsers(usersWithDetails);
      } else {
        setUsersError(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchKYCPending = async () => {
    setKycLoading(true);
    setKycError('');
    try {
      const response = await axiosClient.get('/admin/kyc/pending');
      if (response.data.success) {
        setKycPending(response.data.data || []);
      } else {
        setKycError(response.data.message || 'Failed to fetch KYC applications');
      }
    } catch (error) {
      console.error('Error fetching KYC:', error);
      setKycError('Failed to fetch KYC applications');
    } finally {
      setKycLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTxnLoading(true);
    setTxnError('');
    try {
      const response = await axiosClient.get('/admin/transactions');
      if (response.data.success) {
        setTransactions(response.data.data || []);
      } else {
        setTxnError(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTxnError('Failed to fetch transactions');
    } finally {
      setTxnLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    setDiscountLoading(true);
    setDiscountError('');
    try {
      const response = await axiosClient.get('/admin/discounts');
      if (response.data.success) {
        setDiscounts(response.data.data || []);
      } else {
        setDiscountError(response.data.message || 'Failed to fetch discounts');
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setDiscountError('Failed to fetch discounts');
    } finally {
      setDiscountLoading(false);
    }
  };

  // User management functions
  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const setUserActiveTab = (userId, tabName) => {
    setActiveUserTab(prev => ({ ...prev, [userId]: tabName }));
  };

  const toggleUserActivation = async (userId, currentStatus) => {
    try {
      const response = await axiosClient.put(`/admin/user/${userId}/toggle-activation`, {
        state: !currentStatus
      });
      
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        ));
      }
    } catch (error) {
      console.error('Error toggling user activation:', error);
    }
  };

  const approveKYC = async (applicationId) => {
    try {
      const response = await axiosClient.put(`/admin/kyc/${applicationId}/approve`);
      if (response.data.success) {
        fetchKYCPending();
        fetchUsers(); // Refresh users to update KYC status
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  const rejectKYC = async (applicationId, reason) => {
    try {
      const response = await axiosClient.put(`/admin/kyc/${applicationId}/reject`, { reason });
      if (response.data.success) {
        fetchKYCPending();
        fetchUsers(); // Refresh users to update KYC status
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

  const sendEmail = async () => {
    if (!emailModal.user || !emailForm.subject || !emailForm.message) return;
    
    setSendingEmail(true);
    try {
      const response = await axiosClient.post('/admin/send-email', {
        userId: emailModal.user._id,
        subject: emailForm.subject,
        message: emailForm.message
      });
      
      if (response.data.success) {
        setEmailModal({ open: false, user: null });
        setEmailForm({ subject: '', message: '' });
        alert('Email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive) ||
                         (filterStatus === 'verified' && user.profile?.kyc_status === 'verified') ||
                         (filterStatus === 'pending' && user.profile?.kyc_status === 'pending');
    
    return matchesSearch && matchesStatus;
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
  };

  // Sidebar items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'products', label: 'Products', icon: FaBox },
    { id: 'kyc', label: 'KYC Verification', icon: FaIdCard },
    { id: 'transactions', label: 'Transactions', icon: FaMoneyBill },
    { id: 'discounts', label: 'Discounts', icon: FaPercent },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out shadow-xl`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaTachometerAlt className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">CBI Admin</h1>
                  <p className="text-xs text-gray-300">Banking Panel</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                    tab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'} text-lg`} />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-300 truncate">admin@cbibank.com</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <FaSignOutAlt className={`${sidebarCollapsed ? '' : 'mr-3'} text-lg`} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaBars className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">
                  {tab === 'dashboard' ? 'Dashboard' : tab}
                </h1>
                <p className="text-sm text-gray-500">
                  {tab === 'dashboard' && 'Welcome back, Admin'}
                  {tab === 'users' && `${filteredUsers.length} users found`}
                  {tab === 'kyc' && `${kycPending.length} pending applications`}
                  {tab === 'transactions' && `${transactions.length} transactions`}
                  {tab === 'discounts' && `${discounts.length} active discounts`}
                  {tab === 'settings' && 'Manage system settings'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <FaBell className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Dashboard Content */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.activeUsers} active
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Pending KYC</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingKYC}</p>
                      <p className="text-xs text-orange-600 mt-1">
                        Requires attention
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FaIdCard className="text-orange-600 text-xl" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {stats.recentTransactions} this week
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaMoneyBill className="text-green-600 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setTab('users')}
                    className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaUsers className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Manage Users</span>
                  </button>
                  <button
                    onClick={() => setTab('kyc')}
                    className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <FaIdCard className="text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Review KYC</span>
                  </button>
                  <button
                    onClick={() => setTab('transactions')}
                    className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FaMoneyBill className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">View Transactions</span>
                  </button>
                  <button
                    onClick={() => setTab('discounts')}
                    className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FaPercent className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Manage Discounts</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Management */}
          {tab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="verified">KYC Verified</option>
                      <option value="pending">KYC Pending</option>
                    </select>
                    
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <FaDownload />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Users List */}
              {usersLoading ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading users...</span>
                  </div>
                </div>
              ) : usersError ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-center text-red-600">
                    <FaExclamationTriangle className="mx-auto mb-2 text-2xl" />
                    <p>{usersError}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:gap-6">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                      {/* User Card Header */}
                      <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <FaUser className="text-white text-lg" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.profile?.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                                  user.profile?.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  user.profile?.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  KYC: {user.profile?.kyc_status || 'Not Submitted'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEmailModal({ open: true, user })}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Send Email"
                            >
                              <FaEnvelope />
                            </button>
                            <button
                              onClick={() => toggleUserActivation(user._id, user.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive 
                                  ? 'text-red-600 hover:bg-red-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {user.isActive ? <FaUserTimes /> : <FaUserCheck />}
                            </button>
                            <button
                              onClick={() => toggleUserExpansion(user._id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              {expandedUsers.has(user._id) ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded User Details */}
                      {expandedUsers.has(user._id) && (
                        <div className="p-4 lg:p-6">
                          {/* User Tab Navigation */}
                          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                            {['profile', 'kyc', 'transactions'].map((tabName) => (
                              <button
                                key={tabName}
                                onClick={() => setUserActiveTab(user._id, tabName)}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                  (activeUserTab[user._id] || 'profile') === tabName
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {tabName === 'profile' && <FaUser className="mr-2" />}
                                {tabName === 'kyc' && <FaIdCard className="mr-2" />}
                                {tabName === 'transactions' && <FaHistory className="mr-2" />}
                                {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                              </button>
                            ))}
                          </div>

                          {/* Profile Tab */}
                          {(activeUserTab[user._id] || 'profile') === 'profile' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <FaUserCircle className="text-gray-400" />
                                      <span className="text-sm text-gray-600">Name: {user.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <FaEnvelope className="text-gray-400" />
                                      <span className="text-sm text-gray-600">Email: {user.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <FaPhone className="text-gray-400" />
                                      <span className="text-sm text-gray-600">
                                        Mobile: {user.profile?.mobile_no || 'Not provided'}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <FaCalendarAlt className="text-gray-400" />
                                      <span className="text-sm text-gray-600">
                                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="font-medium text-gray-900">Account Details</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <FaCreditCard className="text-gray-400" />
                                      <span className="text-sm text-gray-600">
                                        Account Type: {user.ac_type}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <FaCheckCircle className="text-gray-400" />
                                      <span className="text-sm text-gray-600">
                                        Email Verified: {user.profile?.isEmailVerified ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <FaInfoCircle className="text-gray-400" />
                                      <span className="text-sm text-gray-600">
                                        Bio: {user.profile?.bio || 'Not provided'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* KYC Tab */}
                          {activeUserTab[user._id] === 'kyc' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">KYC Status</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  user.profile?.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                                  user.profile?.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  user.profile?.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.profile?.kyc_status || 'Not Submitted'}
                                </span>
                              </div>
                              
                              {user.profile?.kyc_status === 'not_submitted' && (
                                <div className="text-center py-8">
                                  <FaExclamationTriangle className="mx-auto mb-2 text-2xl text-gray-400" />
                                  <p className="text-gray-600">KYC documents not submitted yet</p>
                                </div>
                              )}

                              {user.profile?.kyc_status === 'pending' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <div className="flex items-center">
                                    <FaClock className="text-yellow-600 mr-2" />
                                    <span className="text-yellow-800">KYC application is pending review</span>
                                  </div>
                                  <div className="mt-3 flex space-x-2">
                                    <button
                                      onClick={() => approveKYC(user._id)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => rejectKYC(user._id, 'Documents not clear')}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}

                              {user.profile?.kyc_status === 'verified' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="flex items-center">
                                    <FaCheckCircle className="text-green-600 mr-2" />
                                    <span className="text-green-800">KYC verified successfully</span>
                                  </div>
                                </div>
                              )}

                              {user.profile?.kyc_status === 'rejected' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                  <div className="flex items-center">
                                    <FaTimesCircle className="text-red-600 mr-2" />
                                    <span className="text-red-800">KYC application rejected</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Transactions Tab */}
                          {activeUserTab[user._id] === 'transactions' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Recent Transactions</h4>
                                <span className="text-sm text-gray-500">
                                  {user.recentTransactions.length} transactions
                                </span>
                              </div>
                              
                              {user.recentTransactions.length === 0 ? (
                                <div className="text-center py-8">
                                  <FaHistory className="mx-auto mb-2 text-2xl text-gray-400" />
                                  <p className="text-gray-600">No transactions found</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {user.recentTransactions.slice(0, 5).map((transaction, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                          {transaction.type === 'credit' ? (
                                            <FaArrowUp className="text-green-600 text-sm" />
                                          ) : (
                                            <FaArrowDown className="text-red-600 text-sm" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {transaction.description || 'Transaction'}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className={`text-sm font-medium ${
                                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {transaction.status}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Products Management */}
          {tab === 'products' && (
            <div className="space-y-6">
              <ProductManagement />
            </div>
          )}

          {/* KYC Tab Content */}
          {tab === 'kyc' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending KYC Applications</h3>
                {kycLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading KYC applications...</span>
                  </div>
                ) : kycError ? (
                  <div className="text-center py-8 text-red-600">
                    <FaExclamationTriangle className="mx-auto mb-2 text-2xl" />
                    <p>{kycError}</p>
                  </div>
                ) : kycPending.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCheckCircle className="mx-auto mb-2 text-2xl text-gray-400" />
                    <p className="text-gray-600">No pending KYC applications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kycPending.map((application) => (
                      <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{application.user?.name}</h4>
                            <p className="text-sm text-gray-500">{application.user?.email}</p>
                            <p className="text-xs text-gray-400">
                              Applied: {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveKYC(application._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectKYC(application._id, 'Documents not clear')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transactions Tab Content */}
          {tab === 'transactions' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Transactions</h3>
                {txnLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading transactions...</span>
                  </div>
                ) : txnError ? (
                  <div className="text-center py-8 text-red-600">
                    <FaExclamationTriangle className="mx-auto mb-2 text-2xl" />
                    <p>{txnError}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FaHistory className="mx-auto mb-2 text-2xl text-gray-400" />
                    <p className="text-gray-600">No transactions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-medium text-gray-900">Date</th>
                          <th className="px-4 py-3 font-medium text-gray-900">User</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Type</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Amount</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction._id}>
                            <td className="px-4 py-3 text-gray-900">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {transaction.user?.name || 'Unknown'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              ₹{transaction.amount}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discounts Tab Content */}
          {tab === 'discounts' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Discount Management</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FaPlus />
                    <span>Add Discount</span>
                  </button>
                </div>
                
                {discountLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading discounts...</span>
                  </div>
                ) : discountError ? (
                  <div className="text-center py-8 text-red-600">
                    <FaExclamationTriangle className="mx-auto mb-2 text-2xl" />
                    <p>{discountError}</p>
                  </div>
                ) : discounts.length === 0 ? (
                  <div className="text-center py-8">
                    <FaPercent className="mx-auto mb-2 text-2xl text-gray-400" />
                    <p className="text-gray-600">No discounts found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discounts.map((discount) => (
                      <div key={discount._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{discount.name}</h4>
                            <p className="text-sm text-gray-500">{discount.description}</p>
                            <p className="text-xs text-gray-400">
                              Value: {discount.value}{discount.type === 'percent' ? '%' : '₹'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <FaEdit />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab Content */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Send email notifications for important events</p>
                    </div>
                    <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto KYC Approval</h4>
                      <p className="text-sm text-gray-500">Automatically approve KYC applications</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-400 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500">Enable maintenance mode for the application</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-400 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {emailModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Send Email to {emailModal.user?.name}
                </h3>
                <button
                  onClick={() => setEmailModal({ open: false, user: null })}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your message"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEmailModal({ open: false, user: null })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail || !emailForm.subject || !emailForm.message}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}