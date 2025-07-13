"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaUserEdit, FaUserSlash, FaUserCheck, FaMoneyBillWave } from 'react-icons/fa';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [transactions,setTransactions] = useState([]);
  const [txnSearch,setTxnSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin-login');
      return;
    }
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get('/admin/stats', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        setStats(await res.data);

        // fetch pending kyc
        const kycRes = await axiosClient.get('/kyc/pending', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setPending(await kycRes.data);

        // fetch users
        const userRes = await axiosClient.get('/admin/users', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setUsers(await userRes.data);

        // fetch transactions
        const txnRes = await axiosClient.get('/admin/transactions', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setTransactions(await txnRes.data);
      } catch (error) {
        toast.error('Session expired, please login again');
        localStorage.removeItem('admin_token');
        router.push('/admin-login');
      }
    };
    fetchStats();
  }, []);

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin-login';
  };

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTxns = transactions.filter(t=>
    t.remark?.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.user?.name?.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.user?.email?.toLowerCase().includes(txnSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight drop-shadow">Admin Dashboard</h1>
        <button onClick={adminLogout} className="bg-rose-600 hover:bg-rose-700 transition text-white px-5 py-2 rounded shadow font-semibold">Logout</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-700">{stats.userCount}</span>
          <span className="text-gray-500 mt-1">Total Users</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-green-600">{pending.length}</span>
          <span className="text-gray-500 mt-1">Pending KYC</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-purple-700">{stats.msg}</span>
          <span className="text-gray-500 mt-1">System Status</span>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
          <FaUserCheck className="text-green-500" /> Pending KYC Applications
        </h2>
        {pending.length === 0 ? <p className="text-gray-500">No pending applications.</p> : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full text-sm text-left">
              <thead className="border-b bg-blue-50">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Aadhaar</th>
                  <th className="px-4 py-3">PAN</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Docs</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((app) => (
                  <tr key={app._id} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-900">{app.user?.name}</span><br/>
                      <span className="text-xs text-gray-500">{app.user?.email}</span>
                    </td>
                    <td className="px-4 py-3">{app.aadhaarNumber}</td>
                    <td className="px-4 py-3">{app.panNumber}</td>
                    <td className="px-4 py-3">{app.mobileNumber}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={app.address}>{app.address}</td>
                    <td className="px-4 py-3 space-x-2">
                      <a href={app.documents?.aadhaarImage} target="_blank" className="text-blue-600 underline font-medium">Aadhaar</a>
                      <a href={app.documents?.panImage} target="_blank" className="text-blue-600 underline font-medium">PAN</a>
                    </td>
                    <td className="px-4 py-3 space-x-2 flex items-center">
                      <button onClick={() => handleApprove(app._id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 transition text-white rounded flex items-center gap-1"><FaCheckCircle /> Approve</button>
                      <button onClick={() => handleReject(app._id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 transition text-white rounded flex items-center gap-1"><FaTimesCircle /> Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Users table */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
          <FaUserEdit className="text-amber-500" /> Users
        </h2>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border shadow-sm focus:ring-blue-500 ml-auto w-full md:w-80"
        />
      </div>
      {filteredUsers.length === 0 ? <p className="text-gray-500">No users found.</p> : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full text-sm text-left">
              <thead className="border-b bg-purple-50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} className="border-b hover:bg-purple-50 transition">
                    <td className="px-4 py-3 font-semibold text-blue-900">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold"><FaUserCheck /> Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold"><FaUserSlash /> Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 space-x-2 flex items-center">
                      <button onClick={() => toggleActivation(u)} className={`px-3 py-1 rounded flex items-center gap-1 font-semibold transition ${u.isActive ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}>{u.isActive ? <FaUserSlash /> : <FaUserCheck />} {u.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => editProfile(u)} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 transition text-white rounded flex items-center gap-1"><FaUserEdit /> Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Transactions table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            <FaMoneyBillWave className="text-green-500" /> Transactions
          </h2>
          <input
            type="text"
            placeholder="Search transactions..."
            value={txnSearch}
            onChange={(e)=>setTxnSearch(e.target.value)}
            className="px-3 py-2 border rounded shadow-sm focus:ring-blue-500 w-full md:w-80"
          />
        </div>
        {filteredTxns.length === 0 ? <p className="text-gray-500">No transactions.</p> : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full text-sm text-left">
              <thead className="border-b bg-teal-50">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Remark</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.map(tx => (
                  <tr key={tx._id} className="border-b hover:bg-teal-50 transition">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-900">{tx.user?.name}</span><br/>
                      <span className="text-xs text-gray-500">{tx.user?.email}</span>
                    </td>
                    <td className="px-4 py-3">₹{tx.amount}</td>
                    <td className="px-4 py-3 capitalize">{tx.type}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={tx.remark}>{tx.remark}</td>
                    <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {tx.isRefunded ? (
                        <span className="text-green-600 font-medium">Refunded</span>
                      ) : (
                        <button
                          onClick={()=>handleRefund(tx._id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 transition text-white rounded text-sm"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

async function adminAction(id, type) {
  const token = localStorage.getItem('admin_token');
  if (!token) return;
  const url = type === 'approve' ? `/kyc/approve/${id}` : `/kyc/reject/${id}`;
  await axiosClient.post(url, {}, { headers: { Authorization: 'Bearer ' + token } });
}

function handleApprove(id) {
  adminAction(id, 'approve')
    .then(() => {
      toast.success('Approved');
      window.location.reload();
    })
    .catch((err) => toast.error(err.response?.data?.msg || err.message));
}

function handleReject(id) {
  const reason = prompt('Enter reason for rejection (optional)');
  const token = localStorage.getItem('admin_token');
  axiosClient.post(`/kyc/reject/${id}`, { reason }, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => {
      toast.info('Rejected');
      window.location.reload();
    })
    .catch((err) => toast.error(err.response?.data?.msg || err.message));
}

function toggleActivation(user) {
  const token = localStorage.getItem('admin_token');
  axiosClient.post(`/admin/user/${user._id}/activation`, { state: !user.isActive }, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => {
      toast.success('Status changed');
      window.location.reload();
    })
    .catch(err => toast.error(err.response?.data?.msg || err.message));
}

function editProfile(user) {
  const name = prompt('Name', user.name);
  if (name === null) return;
  const email = prompt('Email', user.email);
  if (email === null) return;
  const mobile = prompt('Mobile (leave blank to keep)', '');
  const bio = prompt('Bio (leave blank to keep)', '');
  const token = localStorage.getItem('admin_token');
  axiosClient.post(`/admin/user/${user._id}/update-profile`, { name, email, mobile_no: mobile, bio }, { headers: { Authorization: 'Bearer ' + token } })
    .then(() => {
      toast.success('Profile updated');
      window.location.reload();
    })
    .catch(err => toast.error(err.response?.data?.msg || err.message));
}

function handleRefund(id){
  const token = localStorage.getItem('admin_token');
  if(!token) return;
  if(!confirm('Are you sure you want to refund this transaction?')) return;
  axiosClient.post(`/admin/transactions/${id}/refund`,{},{
    headers:{Authorization:'Bearer '+token}
  }).then(()=>{
    toast.success('Refund processed');
    window.location.reload();
  }).catch(err=> toast.error(err.response?.data?.msg || err.message));
}