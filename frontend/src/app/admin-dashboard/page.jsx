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
  FaTimes
} from 'react-icons/fa';
import { MdDashboard, MdNotifications, MdSettings } from 'react-icons/md';
import { axiosClient } from '@/utils/AxiosClient';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    totalTransactions: 0,
    totalAmount: 0
  });

  // User management
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSort, setUserSort] = useState('name');

  // Transaction management
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilter, setTxnFilter] = useState('all');
  const [txnSort, setTxnSort] = useState('date');

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
  }, []);

  // Fetch functions
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axiosClient.get('/admin/users', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setUsers(response.data);
      setStats(prev => ({ ...prev, totalUsers: response.data.length }));
    } catch (error) {
      setUsersError('Failed to fetch users');
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
      setKycPending(response.data);
      setStats(prev => ({ ...prev, pendingKYC: response.data.length }));
    } catch (error) {
      setKycError('Failed to fetch KYC data');
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
      setTransactions(response.data);
      setStats(prev => ({ 
        ...prev, 
        totalTransactions: response.data.length,
        totalAmount: response.data.reduce((sum, txn) => sum + txn.amount, 0)
      }));
    } catch (error) {
      setTxnError('Failed to fetch transactions');
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
      setDiscounts(response.data);
    } catch (error) {
      setDiscountError('Failed to fetch discounts');
    } finally {
      setDiscountLoading(false);
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
    } catch (error) {
      console.error('Failed to perform user action:', error);
    }
  };

  const handleKYCAction = async (kycId, action) => {
    try {
      await axiosClient.post(`/admin/kyc/${kycId}/${action}`, {}, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      fetchKYC();
    } catch (error) {
      console.error('Failed to perform KYC action:', error);
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
      const res = await axiosClient.get('/admin/discounts', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setDiscounts(res.data);
    } catch (error) {
      console.error('Failed to add discount:', error);
    } finally {
      setAddingDiscount(false);
    }
  };

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
              {/* Stats Cards */}
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
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTab('users')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <FaUsers className="text-2xl text-blue-500 mb-2" />
                    <p className="font-medium">Manage Users</p>
                    <p className="text-sm text-gray-600">View and manage user accounts</p>
                  </button>
                  
                  <button 
                    onClick={() => setTab('kyc')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                  >
                    <FaIdCard className="text-2xl text-green-500 mb-2" />
                    <p className="font-medium">KYC Approvals</p>
                    <p className="text-sm text-gray-600">Review pending verifications</p>
                  </button>
                  
                  <button 
                    onClick={() => setTab('transactions')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all"
                  >
                    <FaMoneyBill className="text-2xl text-purple-500 mb-2" />
                    <p className="font-medium">View Transactions</p>
                    <p className="text-sm text-gray-600">Monitor all transactions</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
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

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                      {users.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50">
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
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.kyc === 'verified' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.kyc || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleUserAction(user.id, 'block')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Block
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'unblock')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Unblock
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
                          <tr key={index} className="hover:bg-gray-50">
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
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleKYCAction(kyc.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleKYCAction(kyc.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((txn, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {txn.id || `TXN${index + 1}`}
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
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
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
    </div>
  );
}