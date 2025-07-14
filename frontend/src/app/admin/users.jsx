import { useEffect, useState } from 'react';
import AdminSidebar from './+__(components)/AdminSidebar';
import UserTable from './+__(components)/UserTable';
import UserDetailsModal from './+__(components)/UserDetailsModal';
import BulkActionsBar from './+__(components)/BulkActionsBar';
import { axiosClient } from '@/utils/AxiosClient';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalUser, setModalUser] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [kyc, setKyc] = useState('');

  const fetchUsers = async () => {
    const res = await axiosClient.get('/admin/users', { params: { search, status, kyc } });
    setUsers(res.data.users);
  };

  useEffect(() => { fetchUsers(); }, [search, status, kyc]);

  const handleSelect = (id, checked) => {
    if (id === 'all') {
      setSelectedIds(checked ? users.map(u => u._id) : []);
    } else {
      setSelectedIds(checked
        ? [...selectedIds, id]
        : selectedIds.filter(_id => _id !== id)
      );
    }
  };

  const handleBlock = async (id) => { await axiosClient.post(`/admin/users/${id}/block`); fetchUsers(); };
  const handleUnblock = async (id) => { await axiosClient.post(`/admin/users/${id}/unblock`); fetchUsers(); };
  const handleReset = async (id) => { await axiosClient.post(`/admin/users/${id}/reset-password`); alert('Password reset!'); };
  const handleView = async (id) => {
    const res = await axiosClient.get(`/admin/users/${id}`);
    setModalUser(res.data.user);
  };

  const handleBulkBlock = async () => {
    await axiosClient.post('/admin/users/bulk-block', { ids: selectedIds });
    setSelectedIds([]);
    fetchUsers();
  };
  const handleBulkUnblock = async () => {
    await axiosClient.post('/admin/users/bulk-unblock', { ids: selectedIds });
    setSelectedIds([]);
    fetchUsers();
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <div className="flex gap-2 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name/email" className="border p-2 rounded" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2 rounded">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <select value={kyc} onChange={e => setKyc(e.target.value)} className="border p-2 rounded">
            <option value="">All KYC</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={fetchUsers} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        </div>
        <UserTable
          users={users}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onReset={handleReset}
          onView={handleView}
        />
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onBulkBlock={handleBulkBlock}
          onBulkUnblock={handleBulkUnblock}
        />
        <UserDetailsModal user={modalUser} onClose={() => setModalUser(null)} />
      </main>
    </div>
  );
}