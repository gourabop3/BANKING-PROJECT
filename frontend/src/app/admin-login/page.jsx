"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axiosClient.post('/admin/login', form);
      const data = await response.data;
      localStorage.setItem('admin_token', data.token);
      toast.success(data.msg || 'Login success');
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white shadow p-6 rounded">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        <div className="mb-3">
          <label htmlFor="email" className="block mb-1">Email</label>
          <input type="email" id="email" name="email" value={form.email} onChange={onChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1">Password</label>
          <input type="password" id="password" name="password" value={form.password} onChange={onChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <button disabled={loading} className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700 disabled:bg-rose-400">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}