"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaSignOutAlt, FaTachometerAlt, FaUser, FaIdCard, FaMoneyBill, FaPercent } from 'react-icons/fa';
import { axiosClient } from '@/utils/AxiosClient';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('users');
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

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      router.push('/admin-login');
    }
  }, [router]);

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-xl h-auto md:h-screen p-6 flex flex-row md:flex-col items-center md:items-stretch">
        <div className="mb-6 md:mb-10 font-extrabold text-2xl tracking-tight text-blue-900 flex items-center gap-2">
          <FaTachometerAlt className="text-3xl text-blue-700" />
          <span>Admin Panel</span>
        </div>
        <nav className="flex-1 w-full">
          <ul className="flex md:flex-col gap-2 w-full">
            <li><button onClick={() => setTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'users' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaUser />Users</button></li>
            <li><button onClick={() => setTab('kyc')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'kyc' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaIdCard />KYC Approvals</button></li>
            <li><button onClick={() => setTab('transactions')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'transactions' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaMoneyBill />Transactions</button></li>
            <li><button onClick={() => setTab('discounts')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'discounts' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaPercent />Recharge Discounts</button></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg hover:bg-rose-600/80 bg-white/10 text-rose-700 mt-6 md:mt-10 w-full justify-center md:justify-start">
          <FaSignOutAlt className="text-2xl" />
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-6 md:mb-8">Welcome, Admin</h1>
        {/* Tabs */}
        {tab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">All Users</h2>
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
      </main>
    </div>
  );
}