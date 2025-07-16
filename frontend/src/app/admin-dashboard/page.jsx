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
  FaChevronRight
} from 'react-icons/fa';
import { MdDashboard, MdNotifications, MdSettings } from 'react-icons/md';
import { axiosClient } from '@/utils/AxiosClient';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      router.push('/admin-login');
    }
  }, [router]);

  // Fetch dashboard stats
  useEffect(() => {
    if (tab === 'dashboard') {
      const fetchStats = async () => {
        try {
          const [usersRes, kycRes, txnRes] = await Promise.all([
            axiosClient.get('/admin/users', {
              headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
            }),
            axiosClient.get('/kyc/pending', {
              headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
            }),
            axiosClient.get('/admin/transactions', {
              headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
            })
          ]);
          
          const totalAmount = txnRes.data.reduce((sum, txn) => sum + (txn.amount || 0), 0);
          
          setStats({
            totalUsers: usersRes.data.users?.length || usersRes.data.length || 0,
            pendingKYC: kycRes.data.length || 0,
            totalTransactions: txnRes.data.length || 0,
            totalAmount: totalAmount
          });
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      };
      
      fetchStats();
    }
  }, [tab]);

  // Fetch users
  useEffect(() => {
    if (tab !== 'users') return;
    setUsersLoading(true); setUsersError('');
    axiosClient.get('/admin/users', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
    })
      .then(res => setUsers(res.data.users || res.data))
      .catch(e => setUsersError('Failed to load users'))
      .finally(() => setUsersLoading(false));
  }, [tab]);

  // Fetch KYC pending
  useEffect(() => {
    if (tab !== 'kyc') return;
    setKycLoading(true); setKycError('');
    axiosClient.get('/kyc/pending', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
    })
      .then(res => setKycPending(res.data))
      .catch(e => setKycError('Failed to load KYC applications'))
      .finally(() => setKycLoading(false));
  }, [tab]);

  // Fetch transactions
  useEffect(() => {
    if (tab !== 'transactions') return;
    setTxnLoading(true); setTxnError('');
    axiosClient.get('/admin/transactions', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
    })
      .then(res => setTransactions(res.data))
      .catch(e => setTxnError('Failed to load transactions'))
      .finally(() => setTxnLoading(false));
  }, [tab]);

  // Fetch discounts
  useEffect(() => {
    if (tab !== 'discounts') return;
    setDiscountLoading(true); setDiscountError('');
    axiosClient.get('/admin/discounts', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
    })
      .then(res => setDiscounts(res.data.discounts || res.data))
      .catch(e => setDiscountError('Failed to load discounts'))
      .finally(() => setDiscountLoading(false));
  }, [tab]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
  };

  // KYC Approve/Reject handlers
  const handleKycApprove = async (id) => {
    try {
      await axiosClient.post(`/kyc/approve/${id}`, {}, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setKycPending(kycPending.filter(u => u._id !== id));
    } catch {
      alert('Failed to approve KYC');
    }
  };
  const handleKycReject = async (id) => {
    try {
      await axiosClient.post(`/kyc/reject/${id}`, {}, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setKycPending(kycPending.filter(u => u._id !== id));
    } catch {
      alert('Failed to reject KYC');
    }
  };

  // Discount add handler
  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if (!discountValue) return;
    setAddingDiscount(true);
    try {
      await axiosClient.post('/admin/discounts', {
        value: discountValue,
        type: discountType,
        isPercentage: discountType === 'percent',
        active: true
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setDiscountValue('');
      setDiscountType('percent');
      // Refresh
      const res = await axiosClient.get('/admin/discounts', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') }
      });
      setDiscounts(res.data.discounts || res.data);
    } catch {
      alert('Failed to add discount');
    }
    setAddingDiscount(false);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'kyc', label: 'KYC Approvals', icon: FaIdCard },
    { id: 'transactions', label: 'Transactions', icon: FaMoneyBill },
    { id: 'discounts', label: 'Discounts', icon: FaPercent },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out shadow-xl`}>
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
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
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
      <main className="flex-1 bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => item.id === tab)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600">Manage your banking platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <FaBell className="text-lg" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <FaUser className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaUsers className="text-3xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-blue-100">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaIdCard className="text-3xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-green-100">Pending KYC</p>
                      <p className="text-2xl font-bold">{stats.pendingKYC}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaMoneyBill className="text-3xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-purple-100">Transactions</p>
                      <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaChartBar className="text-3xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-orange-100">Total Amount</p>
                      <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Users</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {users.length} Total
                  </span>
                </div>
              </div>
            {usersLoading ? <div className="text-center py-8">Loading users...</div> : usersError ? <div className="text-center text-red-600 py-8">{usersError}</div> : (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full min-w-[600px] bg-white rounded-xl shadow mb-8 text-sm md:text-base">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">KYC</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id || u.id} className="border-b hover:bg-blue-50">
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3 capitalize">{u.kyc_status || u.kyc}</td>
                        <td className="p-3 capitalize">{u.status || (u.isActive ? 'active' : 'blocked')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {tab === 'kyc' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">KYC Approvals</h2>
            {kycLoading ? <div className="text-center py-8">Loading KYC applications...</div> : kycError ? <div className="text-center text-red-600 py-8">{kycError}</div> : (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full min-w-[600px] bg-white rounded-xl shadow mb-8 text-sm md:text-base">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">KYC Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycPending.map(u => (
                      <tr key={u._id} className="border-b hover:bg-blue-50">
                        <td className="p-3">{u.user?.name}</td>
                        <td className="p-3">{u.user?.email}</td>
                        <td className="p-3 capitalize">pending</td>
                        <td className="p-3 space-x-2">
                          <button onClick={() => handleKycApprove(u._id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded">Approve</button>
                          <button onClick={() => handleKycReject(u._id)} className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {tab === 'transactions' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">All Transactions</h2>
            {txnLoading ? <div className="text-center py-8">Loading transactions...</div> : txnError ? <div className="text-center text-red-600 py-8">{txnError}</div> : (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full min-w-[600px] bg-white rounded-xl shadow mb-8 text-sm md:text-base">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t._id || t.id} className="border-b hover:bg-blue-50">
                        <td className="p-3">{t.user?.name || t.user}</td>
                        <td className="p-3">₹{t.amount}</td>
                        <td className="p-3 capitalize">{t.type}</td>
                        <td className="p-3">{new Date(t.createdAt || t.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {tab === 'discounts' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Recharge Discounts</h2>
            <form onSubmit={handleAddDiscount} className="flex flex-col md:flex-row gap-4 mb-6">
              <input type="number" min="1" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="Discount Value" className="border p-2 rounded w-full md:w-32" required />
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="border p-2 rounded w-full md:w-auto">
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
              <button type="submit" disabled={addingDiscount} className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto disabled:bg-blue-300">{addingDiscount ? 'Adding...' : 'Add Discount'}</button>
            </form>
            {discountLoading ? <div className="text-center py-8">Loading discounts...</div> : discountError ? <div className="text-center text-red-600 py-8">{discountError}</div> : (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full min-w-[400px] bg-white rounded-xl shadow text-sm md:text-base">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-3">Value</th>
                      <th className="p-3">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(d => (
                      <tr key={d._id || d.id} className="border-b hover:bg-blue-50">
                        <td className="p-3">{d.value}{d.isPercentage || d.type === 'percent' ? '%' : '₹'}</td>
                        <td className="p-3 capitalize">{d.type || (d.isPercentage ? 'percent' : 'flat')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCog className="mr-2" />
                    System Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Maintenance Mode</span>
                      <button className="bg-gray-200 rounded-full w-12 h-6 flex items-center px-1">
                        <div className="bg-white w-4 h-4 rounded-full shadow transform transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Enable New Registrations</span>
                      <button className="bg-blue-500 rounded-full w-12 h-6 flex items-center justify-end px-1">
                        <div className="bg-white w-4 h-4 rounded-full shadow transform transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Email Notifications</span>
                      <button className="bg-blue-500 rounded-full w-12 h-6 flex items-center justify-end px-1">
                        <div className="bg-white w-4 h-4 rounded-full shadow transform transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUser className="mr-2" />
                    Security Settings
                  </h3>
                  <div className="space-y-4">
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
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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