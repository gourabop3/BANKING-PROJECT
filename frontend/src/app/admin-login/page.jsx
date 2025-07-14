"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Hardcoded credentials for demo
    if (form.username === 'admin@123' && form.password === 'admin123') {
      localStorage.setItem('admin_token', 'demo_admin_token');
      router.push('/admin-dashboard');
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white shadow-xl p-8 rounded-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-900">Admin Login</h2>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1 font-semibold">Username</label>
          <input type="text" id="username" name="username" value={form.username} onChange={onChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400" autoComplete="username" />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 font-semibold">Password</label>
          <input type="password" id="password" name="password" value={form.password} onChange={onChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400" autoComplete="current-password" />
        </div>
        {error && <div className="mb-4 text-red-600 text-center font-semibold">{error}</div>}
        <button disabled={loading} className="w-full bg-blue-700 text-white py-2 rounded font-bold text-lg hover:bg-blue-800 transition disabled:bg-blue-400">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}