"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaSignOutAlt, FaTachometerAlt, FaUser, FaIdCard, FaMoneyBill, FaPercent } from 'react-icons/fa';

const mockUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com', kyc: 'pending', status: 'active' },
  { id: 2, name: 'Bob', email: 'bob@example.com', kyc: 'verified', status: 'active' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', kyc: 'pending', status: 'blocked' },
];
const mockTransactions = [
  { id: 1, user: 'Alice', amount: 1000, type: 'credit', date: '2024-06-01' },
  { id: 2, user: 'Bob', amount: 500, type: 'debit', date: '2024-06-02' },
];
const mockDiscounts = [
  { id: 1, value: 10, type: 'percent' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState(mockUsers);
  const [discounts, setDiscounts] = useState(mockDiscounts);
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState('percent');

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      router.push('/admin-login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
  };

  // KYC Approve/Reject handlers
  const handleKycApprove = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, kyc: 'verified' } : u));
  };
  const handleKycReject = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, kyc: 'rejected' } : u));
  };

  // Discount add handler
  const handleAddDiscount = (e) => {
    e.preventDefault();
    if (!discountValue) return;
    setDiscounts([...discounts, { id: Date.now(), value: discountValue, type: discountType }]);
    setDiscountValue('');
    setDiscountType('percent');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl h-screen p-6 flex flex-col">
        <div className="mb-10 font-extrabold text-2xl tracking-tight text-blue-900 flex items-center gap-2">
          <FaTachometerAlt className="text-3xl text-blue-700" />
          Admin Panel
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li><button onClick={() => setTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'users' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaUser />Users</button></li>
            <li><button onClick={() => setTab('kyc')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'kyc' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaIdCard />KYC Approvals</button></li>
            <li><button onClick={() => setTab('transactions')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'transactions' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaMoneyBill />Transactions</button></li>
            <li><button onClick={() => setTab('discounts')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg w-full ${tab === 'discounts' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}><FaPercent />Recharge Discounts</button></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg hover:bg-rose-600/80 bg-white/10 text-rose-700 mt-10">
          <FaSignOutAlt className="text-2xl" />
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-8">Welcome, Admin</h1>
        {/* Tabs */}
        {tab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">All Users</h2>
            <table className="w-full bg-white rounded-xl shadow mb-8">
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
                  <tr key={u.id} className="border-b hover:bg-blue-50">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">{u.kyc}</td>
                    <td className="p-3 capitalize">{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'kyc' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">KYC Approvals</h2>
            <table className="w-full bg-white rounded-xl shadow mb-8">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">KYC Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.kyc === 'pending').map(u => (
                  <tr key={u.id} className="border-b hover:bg-blue-50">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">{u.kyc}</td>
                    <td className="p-3 space-x-2">
                      <button onClick={() => handleKycApprove(u.id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded">Approve</button>
                      <button onClick={() => handleKycReject(u.id)} className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'transactions' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">All Transactions</h2>
            <table className="w-full bg-white rounded-xl shadow mb-8">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-3">User</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map(t => (
                  <tr key={t.id} className="border-b hover:bg-blue-50">
                    <td className="p-3">{t.user}</td>
                    <td className="p-3">₹{t.amount}</td>
                    <td className="p-3 capitalize">{t.type}</td>
                    <td className="p-3">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'discounts' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Recharge Discounts</h2>
            <form onSubmit={handleAddDiscount} className="flex gap-4 mb-6">
              <input type="number" min="1" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="Discount Value" className="border p-2 rounded w-32" required />
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="border p-2 rounded">
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Discount</button>
            </form>
            <table className="w-full bg-white rounded-xl shadow">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-3">Value</th>
                  <th className="p-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id} className="border-b hover:bg-blue-50">
                    <td className="p-3">{d.value}{d.type === 'percent' ? '%' : '₹'}</td>
                    <td className="p-3 capitalize">{d.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}