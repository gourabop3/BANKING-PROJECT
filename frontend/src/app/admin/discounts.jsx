import { useEffect, useState } from 'react';
import AdminSidebar from './+__(components)/AdminSidebar';
import { axiosClient } from '@/utils/AxiosClient';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'recharge', value: '', isPercentage: true });
  const [editId, setEditId] = useState(null);

  const fetchDiscounts = async () => {
    const res = await axiosClient.get('/admin/discounts');
    setDiscounts(res.data.discounts);
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const openModal = (discount = null) => {
    setEditId(discount?._id || null);
    setForm(discount ? { ...discount } : { type: 'recharge', value: '', isPercentage: true });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axiosClient.put(`/admin/discounts/${editId}`, form);
    } else {
      await axiosClient.post('/admin/discounts', form);
    }
    closeModal();
    fetchDiscounts();
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    await axiosClient.delete(`/admin/discounts/${id}`);
    fetchDiscounts();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Recharge Discounts</h1>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"><FaPlus /> Add Discount</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Active</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(discount => (
                <tr key={discount._id} className="border-b hover:bg-blue-50">
                  <td className="p-3 capitalize">{discount.type}</td>
                  <td className="p-3">{discount.value}{discount.isPercentage ? '%' : '₹'}</td>
                  <td className="p-3">{discount.active ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-600" />}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => openModal(discount)} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded"><FaEdit /></button>
                    <button onClick={() => handleDelete(discount._id)} className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {discounts.length === 0 && <div className="text-center py-4 text-gray-500">No discounts found.</div>}
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Discount</h2>
              <div className="mb-3">
                <label className="block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border rounded p-2">
                  <option value="recharge">Recharge</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1">Value</label>
                <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full border rounded p-2" required />
              </div>
              <div className="mb-3 flex items-center gap-2">
                <input type="checkbox" checked={form.isPercentage} onChange={e => setForm({ ...form, isPercentage: e.target.checked })} />
                <span>Percentage</span>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                <span>Active</span>
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