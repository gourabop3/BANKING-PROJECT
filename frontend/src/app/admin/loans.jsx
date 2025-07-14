import { useEffect, useState } from 'react';
import AdminSidebar from '../+__(components)/AdminSidebar';
import { axiosClient } from '@/utils/AxiosClient';
import { FaCheck, FaTimes, FaMoneyBillWave } from 'react-icons/fa';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLoans = async () => {
    setLoading(true);
    const res = await axiosClient.get('/admin/loans');
    setLoans(res.data.loans);
    setLoading(false);
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this loan?`)) return;
    await axiosClient.post(`/admin/loans/${id}/${action}`);
    fetchLoans();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Loan Applications</h1>
        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-3">User</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan._id} className="border-b hover:bg-blue-50">
                  <td className="p-3">{loan.user?.name} <br /><span className="text-xs text-gray-500">{loan.user?.email}</span></td>
                  <td className="p-3">₹{loan.amount}</td>
                  <td className="p-3 capitalize font-semibold">{loan.status}</td>
                  <td className="p-3 space-x-2">
                    {loan.status === 'pending' && <>
                      <button onClick={() => handleAction(loan._id, 'approve')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1"><FaCheck /> Approve</button>
                      <button onClick={() => handleAction(loan._id, 'reject')} className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center gap-1"><FaTimes /> Reject</button>
                    </>}
                    {loan.status === 'approved' && <button onClick={() => handleAction(loan._id, 'disburse')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"><FaMoneyBillWave /> Disburse</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="text-center py-4">Loading...</div>}
          {!loading && loans.length === 0 && <div className="text-center py-4 text-gray-500">No loan applications found.</div>}
        </div>
      </main>
    </div>
  );
}