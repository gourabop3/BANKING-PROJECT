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
  FaBell,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaEye,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaDownload,
  FaFilter,
  FaSort,
  FaUserPlus,
  FaUserMinus,
  FaUserShield,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaFileAlt,
  FaSend,
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelopeOpen,
  FaUserTie,
  FaUnlock,
  FaLock
} from 'react-icons/fa';
import { MdDashboard, MdNotifications, MdSettings, MdEmail, MdClose } from 'react-icons/md';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // User Detail Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailTab, setUserDetailTab] = useState('profile');
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  
  // Email Modal States
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  
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
  
  // Individual user data
  const [userTransactions, setUserTransactions] = useState([]);
  const [userKyc, setUserKyc] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    totalTransactions: 0,
    totalAmount: 0,
    activeUsers: 0,
    blockedUsers: 0,
    verifiedUsers: 0,
    todayTransactions: 0
  });

  // User management
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSort, setUserSort] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Transaction management
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilter, setTxnFilter] = useState('all');
  const [txnSort, setTxnSort] = useState('date');

  // Email templates
  const emailTemplates = {
    welcome: {
      subject: 'Welcome to CBI Banking',
      message: 'Dear {name},\n\nWelcome to CBI Banking! Your account has been successfully created.\n\nBest regards,\nCBI Banking Team'
    },
    kyc_approved: {
      subject: 'KYC Verification Approved',
      message: 'Dear {name},\n\nYour KYC verification has been approved. You can now access all banking services.\n\nBest regards,\nCBI Banking Team'
    },
    kyc_rejected: {
      subject: 'KYC Verification Rejected',
      message: 'Dear {name},\n\nYour KYC verification has been rejected. Please resubmit your documents.\n\nBest regards,\nCBI Banking Team'
    },
    account_blocked: {
      subject: 'Account Temporarily Blocked',
      message: 'Dear {name},\n\nYour account has been temporarily blocked for security reasons. Please contact support.\n\nBest regards,\nCBI Banking Team'
    },
    custom: {
      subject: '',
      message: ''
    }
  };

  // Check auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      router.push('/admin-login');
      return;
    }
    
    // Fetch initial data
    fetchUsers();
    fetchKYC();
    fetchTransactions();
    fetchDiscounts();
    fetchStats();
  }, []);

  // Fetch functions
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axiosClient.get('/admin/users', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setUsers(response.data.users || response.data || []);
      setStats(prev => ({ ...prev, totalUsers: (response.data.users || response.data || []).length }));
    } catch (error) {
      setUsersError('Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchKYC = async () => {
    setKycLoading(true);
    try {
      const response = await axiosClient.get('/admin/kyc/pending', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setKycPending(response.data || []);
      setStats(prev => ({ ...prev, pendingKYC: (response.data || []).length }));
    } catch (error) {
      setKycError('Failed to fetch KYC data');
      toast.error('Failed to fetch KYC data');
    } finally {
      setKycLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTxnLoading(true);
    try {
      const response = await axiosClient.get('/admin/transactions', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setTransactions(response.data || []);
      setStats(prev => ({ 
        ...prev, 
        totalTransactions: (response.data || []).length,
        totalAmount: (response.data || []).reduce((sum, txn) => sum + (txn.amount || 0), 0)
      }));
    } catch (error) {
      setTxnError('Failed to fetch transactions');
      toast.error('Failed to fetch transactions');
    } finally {
      setTxnLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    setDiscountLoading(true);
    try {
      const response = await axiosClient.get('/admin/discounts', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setDiscounts(response.data.discounts || response.data || []);
    } catch (error) {
      setDiscountError('Failed to fetch discounts');
      toast.error('Failed to fetch discounts');
    } finally {
      setDiscountLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get('/admin/stats', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setStats(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch individual user data
  const fetchUserDetails = async (userId) => {
    setUserDetailLoading(true);
    try {
      const [profileRes, transactionsRes, kycRes, activityRes] = await Promise.all([
        axiosClient.get(`/admin/users/${userId}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
        }),
        axiosClient.get(`/admin/users/${userId}/transactions`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
        }),
        axiosClient.get(`/admin/users/${userId}/kyc`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
        }),
        axiosClient.get(`/admin/users/${userId}/activity`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
        })
      ]);
      
      setUserProfile(profileRes.data);
      setUserTransactions(transactionsRes.data || []);
      setUserKyc(kycRes.data);
      setUserActivity(activityRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch user details');
    } finally {
      setUserDetailLoading(false);
    }
  };

  // Action handlers
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
  };

  const handleUserAction = async (userId, action) => {
    try {
      await axiosClient.post(`/admin/users/${userId}/${action}`, {}, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      fetchUsers();
      toast.success(`User ${action} successfully`);
      
      // Update selected user if currently viewing
      if (selectedUser && selectedUser._id === userId) {
        fetchUserDetails(userId);
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleKYCAction = async (kycId, action) => {
    try {
      await axiosClient.post(`/admin/kyc/${kycId}/${action}`, {}, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      fetchKYC();
      fetchUsers();
      toast.success(`KYC ${action} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} KYC`);
    }
  };

  const handleAddDiscount = async () => {
    if (!discountValue) return;
    
    setAddingDiscount(true);
    try {
      await axiosClient.post('/admin/discounts', {
        value: discountValue,
        type: discountType
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      
      setDiscountValue('');
      fetchDiscounts();
      toast.success('Discount added successfully');
    } catch (error) {
      toast.error('Failed to add discount');
    } finally {
      setAddingDiscount(false);
    }
  };

  // User detail modal handlers
  const openUserDetail = (user) => {
    setSelectedUser(user);
    setUserDetailTab('profile');
    fetchUserDetails(user._id || user.id);
  };

  const closeUserDetail = () => {
    setSelectedUser(null);
    setUserProfile(null);
    setUserTransactions([]);
    setUserKyc(null);
    setUserActivity([]);
  };

  // Email handlers
  const openEmailModal = (user = null) => {
    setEmailRecipient(user);
    setEmailModalOpen(true);
    setEmailSubject('');
    setEmailMessage('');
    setEmailTemplate('custom');
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setEmailRecipient(null);
    setEmailSubject('');
    setEmailMessage('');
    setEmailTemplate('custom');
  };

  const handleEmailTemplateChange = (template) => {
    setEmailTemplate(template);
    if (template !== 'custom') {
      setEmailSubject(emailTemplates[template].subject);
      setEmailMessage(emailTemplates[template].message);
    }
  };

  const sendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please fill in subject and message');
      return;
    }

    setEmailSending(true);
    try {
      const recipientData = emailRecipient ? [emailRecipient] : selectedUsers.map(id => users.find(u => u._id === id));
      
      await axiosClient.post('/admin/send-email', {
        recipients: recipientData,
        subject: emailSubject,
        message: emailMessage,
        template: emailTemplate
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      
      toast.success('Email sent successfully');
      closeEmailModal();
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    try {
      await axiosClient.post(`/admin/users/bulk/${action}`, {
        userIds: selectedUsers
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      
      fetchUsers();
      setSelectedUsers([]);
      toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  // Utility functions
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id || user.id));
    }
  };

  // Filter and sort functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
                         user.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = userFilter === 'all' || 
                         (userFilter === 'active' && user.isActive) ||
                         (userFilter === 'blocked' && !user.isActive) ||
                         (userFilter === 'verified' && user.kyc_status === 'verified') ||
                         (userFilter === 'pending' && user.kyc_status === 'pending');
    return matchesSearch && matchesFilter;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (userSort) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'email':
        return (a.email || '').localeCompare(b.email || '');
      case 'date':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [tab]);

  // Sidebar items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'kyc', label: 'KYC Verification', icon: FaIdCard },
    { id: 'transactions', label: 'Transactions', icon: FaMoneyBill },
    { id: 'discounts', label: 'Discounts', icon: FaPercent },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile Overlay */}
      {(mobileMenuOpen || selectedUser || emailModalOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            setMobileMenuOpen(false);
            if (selectedUser) closeUserDetail();
            if (emailModalOpen) closeEmailModal();
          }}
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
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-red-300 hover:bg-red-600 hover:text-white transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <FaSignOutAlt className={`${sidebarCollapsed ? '' : 'mr-3'} text-lg`} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaBars className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {sidebarItems.find(item => item.id === tab)?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Manage your banking platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => openEmailModal()}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                title="Send Bulk Email"
              >
                <FaEnvelope className="text-lg" />
              </button>
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <FaBell className="text-lg" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <FaUser className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6">
          {/* Dashboard Tab */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaUsers className="text-2xl sm:text-3xl" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-blue-100 text-sm sm:text-base">Total Users</p>
                      <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaIdCard className="text-2xl sm:text-3xl" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-green-100 text-sm sm:text-base">Pending KYC</p>
                      <p className="text-xl sm:text-2xl font-bold">{stats.pendingKYC}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaMoneyBill className="text-2xl sm:text-3xl" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-purple-100 text-sm sm:text-base">Transactions</p>
                      <p className="text-xl sm:text-2xl font-bold">{stats.totalTransactions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaChartBar className="text-2xl sm:text-3xl" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-orange-100 text-sm sm:text-base">Total Amount</p>
                      <p className="text-xl sm:text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTab('users')}
                      className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <FaUsers className="text-blue-600 text-xl mr-2" />
                      <span className="text-blue-600 font-medium">Manage Users</span>
                    </button>
                    <button
                      onClick={() => setTab('kyc')}
                      className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <FaIdCard className="text-green-600 text-xl mr-2" />
                      <span className="text-green-600 font-medium">KYC Review</span>
                    </button>
                    <button
                      onClick={() => openEmailModal()}
                      className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <FaEnvelope className="text-purple-600 text-xl mr-2" />
                      <span className="text-purple-600 font-medium">Send Email</span>
                    </button>
                    <button
                      onClick={() => setTab('transactions')}
                      className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <FaMoneyBill className="text-orange-600 text-xl mr-2" />
                      <span className="text-orange-600 font-medium">View Transactions</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600 text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name || 'User'} joined
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email || 'email@example.com'}
                          </p>
                        </div>
                        <button
                          onClick={() => openUserDetail(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Users Tab */}
          {tab === 'users' && (
            <div className="space-y-6">
              {/* Search, Filter, and Bulk Actions */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending KYC</option>
                    </select>
                    <select
                      value={userSort}
                      onChange={(e) => setUserSort(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="email">Sort by Email</option>
                      <option value="date">Sort by Date</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      {selectedUsers.length} users selected
                    </span>
                    <button
                      onClick={() => handleBulkAction('block')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Block All
                    </button>
                    <button
                      onClick={() => handleBulkAction('unblock')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Unblock All
                    </button>
                    <button
                      onClick={() => openEmailModal()}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Send Email
                    </button>
                  </div>
                )}
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KYC
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((user, index) => (
                        <tr key={user._id || index} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id || user.id)}
                              onChange={() => toggleUserSelection(user._id || user.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FaUser className="text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name || 'User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email || 'email@example.com'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive !== false
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive !== false ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.kyc_status === 'verified' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.kyc_status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openUserDetail(user)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => openEmailModal(user)}
                                className="text-green-600 hover:text-green-900"
                                title="Send Email"
                              >
                                <FaEnvelope />
                              </button>
                              <button
                                onClick={() => handleUserAction(user._id, user.isActive !== false ? 'block' : 'unblock')}
                                className={`${user.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                title={user.isActive !== false ? 'Block User' : 'Unblock User'}
                              >
                                {user.isActive !== false ? <FaLock /> : <FaUnlock />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, sortedUsers.length)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{sortedUsers.length}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FaArrowLeft className="h-3 w-3" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FaArrowRight className="h-3 w-3" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KYC Tab */}
          {tab === 'kyc' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending KYC Verifications</h3>
                {kycLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading KYC applications...</p>
                  </div>
                ) : kycPending.length === 0 ? (
                  <div className="text-center py-8">
                    <FaIdCard className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">No pending KYC applications</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documents
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {kycPending.map((kyc, index) => (
                          <tr key={kyc._id || index} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaUser className="text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {kyc.user?.name || 'User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {kyc.user?.email || 'email@example.com'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="space-x-2">
                                <a
                                  href={kyc.documents?.aadhaar}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  Aadhaar
                                </a>
                                <a
                                  href={kyc.documents?.pan}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  PAN
                                </a>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleKYCAction(kyc._id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  <FaCheckCircle />
                                </button>
                                <button
                                  onClick={() => handleKYCAction(kyc._id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject"
                                >
                                  <FaTimesCircle />
                                </button>
                                <button
                                  onClick={() => openUserDetail(kyc.user)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View User"
                                >
                                  <FaEye />
                                </button>
                              </div>
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

          {/* Transactions Tab */}
          {tab === 'transactions' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={txnSearch}
                      onChange={(e) => setTxnSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={txnFilter}
                    onChange={(e) => setTxnFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Transactions</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                  <select
                    value={txnSort}
                    onChange={(e) => setTxnSort(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="type">Sort by Type</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((txn, index) => (
                        <tr key={txn._id || index} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {txn._id || `TXN${index + 1}`}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{txn.user?.name || 'User'}</div>
                            <div className="text-sm text-gray-500">{txn.user?.email || 'email@example.com'}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              txn.type === 'credit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.type || 'Credit'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{txn.amount?.toLocaleString() || '0'}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {txn.date || new Date().toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              txn.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {txn.status || 'Completed'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => txn.user && openUserDetail(txn.user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View User"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Discounts Tab */}
          {tab === 'discounts' && (
            <div className="space-y-6">
              {/* Add Discount Form */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Discount</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Discount value"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="percent">Percentage</option>
                      <option value="amount">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <button
                      onClick={handleAddDiscount}
                      disabled={addingDiscount || !discountValue}
                      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      {addingDiscount ? 'Adding...' : 'Add Discount'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Discounts List */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Discounts</h3>
                {discounts.length === 0 ? (
                  <div className="text-center py-8">
                    <FaPercent className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">No active discounts</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discounts.map((discount, index) => (
                      <div key={discount._id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {discount.type === 'percent' ? `${discount.value}%` : `₹${discount.value}`}
                          </span>
                          <span className="text-sm text-gray-500">
                            {discount.type === 'percent' ? 'Percentage' : 'Fixed Amount'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {discount.description || 'No description'}
                        </p>
                        <button className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
                
                {/* General Settings */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">General</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          System Name
                        </label>
                        <input
                          type="text"
                          defaultValue="CBI Banking System"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          defaultValue="support@cbibank.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Security</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="180"
                          defaultValue="30"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Login Attempts
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          defaultValue="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                  <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Reset to Default
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <p className="text-sm text-gray-500">{selectedUser.name || 'User'}</p>
              </div>
              <button
                onClick={closeUserDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['profile', 'transactions', 'kyc', 'activity'].map((tabName) => (
                  <button
                    key={tabName}
                    onClick={() => setUserDetailTab(tabName)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                      userDetailTab === tabName
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tabName}
                  </button>
                ))}
              </nav>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {userDetailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <>
                  {/* Profile Tab */}
                  {userDetailTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Full Name</label>
                              <p className="text-sm text-gray-900">{selectedUser.name || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Email</label>
                              <p className="text-sm text-gray-900">{selectedUser.email || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Phone</label>
                              <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Join Date</label>
                              <p className="text-sm text-gray-900">
                                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Not available'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Account Status</label>
                              <p className={`text-sm font-medium ${
                                selectedUser.isActive !== false ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {selectedUser.isActive !== false ? 'Active' : 'Blocked'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">KYC Status</label>
                              <p className={`text-sm font-medium ${
                                selectedUser.kyc_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {selectedUser.kyc_status || 'Pending'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Last Login</label>
                              <p className="text-sm text-gray-900">
                                {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleUserAction(selectedUser._id, selectedUser.isActive !== false ? 'block' : 'unblock')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedUser.isActive !== false
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {selectedUser.isActive !== false ? 'Block User' : 'Unblock User'}
                        </button>
                        <button
                          onClick={() => openEmailModal(selectedUser)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Send Email
                        </button>
                        <button
                          onClick={() => handleUserAction(selectedUser._id, 'reset-password')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                        >
                          Reset Password
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Transactions Tab */}
                  {userDetailTab === 'transactions' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">User Transactions</h3>
                      {userTransactions.length === 0 ? (
                        <div className="text-center py-8">
                          <FaMoneyBill className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-600">No transactions found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userTransactions.map((txn, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{txn.type || 'Transaction'}</p>
                                <p className="text-xs text-gray-500">{txn.date || 'Today'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">₹{txn.amount?.toLocaleString() || '0'}</p>
                                <p className={`text-xs ${
                                  txn.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {txn.status || 'Completed'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* KYC Tab */}
                  {userDetailTab === 'kyc' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">KYC Information</h3>
                      {userKyc ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className={`text-sm font-medium ${
                              userKyc.status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {userKyc.status || 'Pending'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Documents</label>
                            <div className="mt-2 space-x-2">
                              {userKyc.documents?.aadhaar && (
                                <a
                                  href={userKyc.documents.aadhaar}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View Aadhaar
                                </a>
                              )}
                              {userKyc.documents?.pan && (
                                <a
                                  href={userKyc.documents.pan}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View PAN
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FaIdCard className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-600">No KYC information available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activity Tab */}
                  {userDetailTab === 'activity' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                      {userActivity.length === 0 ? (
                        <div className="text-center py-8">
                          <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-600">No activity found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userActivity.map((activity, index) => (
                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0">
                                <FaHistory className="text-gray-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{activity.action || 'Activity'}</p>
                                <p className="text-xs text-gray-500">{activity.date || 'Today'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
                <p className="text-sm text-gray-500">
                  {emailRecipient 
                    ? `To: ${emailRecipient.name || emailRecipient.email}`
                    : `To: ${selectedUsers.length} selected users`
                  }
                </p>
              </div>
              <button
                onClick={closeEmailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Template
                  </label>
                  <select
                    value={emailTemplate}
                    onChange={(e) => handleEmailTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="custom">Custom Email</option>
                    <option value="welcome">Welcome Email</option>
                    <option value="kyc_approved">KYC Approved</option>
                    <option value="kyc_rejected">KYC Rejected</option>
                    <option value="account_blocked">Account Blocked</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email subject"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your message here..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{name}'} to personalize with user's name
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeEmailModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={emailSending || !emailSubject || !emailMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
              >
                {emailSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaSend className="mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}