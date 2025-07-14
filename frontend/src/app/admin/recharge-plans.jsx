import { useEffect, useState } from 'react';
import AdminSidebar from '../(root)/admin/+__(components)/AdminSidebar';
import { axiosClient } from '@/utils/AxiosClient';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function AdminRechargePlansPage() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: '', data: '', validity: '', description: '' });
  const [editId, setEditId] = useState(null);

  const fetchPlans = async () => {
    const res = await axiosClient.get('/admin/recharge-plans');
    setPlans(res.data.plans);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openModal = (plan = null) => {
    setEditId(plan?._id || null);
    setForm(plan ? { ...plan } : { amount: '', data: '', validity: '', description: '' });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axiosClient.put(`/admin/recharge-plans/${editId}`, form);
    } else {
      await axiosClient.post('/admin/recharge-plans', form);
    }
    closeModal();
    fetchPlans();
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    await axiosClient.delete(`/admin/recharge-plans/${id}`);
    fetchPlans();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Recharge Plans</h1>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"><FaPlus /> Add Plan</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-3">Amount</th>
                <th className="p-3">Data</th>
                <th className="p-3">Validity</th>
                <th className="p-3">Description</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan._id} className="border-b hover:bg-blue-50">
                  <td className="p-3">₹{plan.amount}</td>
                  <td className="p-3">{plan.data}</td>
                  <td className="p-3">{plan.validity}</td>
                  <td className="p-3">{plan.description}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => openModal(plan)} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded"><FaEdit /></button>
                    <button onClick={() => handleDelete(plan._id)} className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {plans.length === 0 && <div className="text-center py-4 text-gray-500">No plans found.</div>}
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Plan</h2>
              <div className="mb-3">
                <label className="block mb-1">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Data</label>
                <input type="text" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="w-full border rounded p-2" placeholder="e.g. 1GB/day" required />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Validity</label>
                <input type="text" value={form.validity} onChange={e => setForm({ ...form, validity: e.target.value })} className="w-full border rounded p-2" placeholder="e.g. 28 days" required />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
                <button type="button" onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}