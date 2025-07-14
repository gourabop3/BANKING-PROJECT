"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin-dashboard', icon: <FaTachometerAlt />, active: true },
];

export default function AdminDashboard() {
  const router = useRouter();
  useEffect(() => {
    // Simple auth check
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      router.push('/admin-login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
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
            {sidebarLinks.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg ${link.active ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700'}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-700">1,234</span>
            <span className="text-gray-500 mt-1">Total Users</span>
          </div>
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center">
            <span className="text-3xl font-bold text-green-600">₹56,789</span>
            <span className="text-gray-500 mt-1">Total Revenue</span>
          </div>
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center">
            <span className="text-3xl font-bold text-purple-700">Active</span>
            <span className="text-gray-500 mt-1">System Status</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">Quick Actions</h2>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow">Add User</button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow">View Reports</button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow">Settings</button>
          </div>
        </div>
      </main>
    </div>
  );
}