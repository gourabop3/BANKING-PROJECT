import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdDashboard, MdPeople, MdAttachMoney, MdLocalOffer, MdLogout } from 'react-icons/md';
import { FaListUl } from 'react-icons/fa';
import { useState } from 'react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: MdDashboard },
  { href: '/admin/users', label: 'Users', Icon: MdPeople },
  { href: '/admin/loans', label: 'Loans', Icon: MdAttachMoney },
  { href: '/admin/discounts', label: 'Discounts', Icon: MdLocalOffer },
  { href: '/admin/recharge-plans', label: 'Recharge Plans', Icon: FaListUl },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-800 to-purple-700 shadow-xl z-40 transform transition-transform duration-300 flex flex-col text-white ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="mb-10 font-extrabold text-2xl tracking-tight flex items-center gap-2 px-6 pt-6">
          <MdDashboard className="text-3xl" />
          Bank Admin
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 px-2">
            {links.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg hover:bg-blue-600/70 ${pathname === href ? 'bg-white/20 shadow text-yellow-300' : ''}`}
                >
                  <Icon className="text-2xl" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-10 px-2 pb-6">
          <Link href="/admin-login" onClick={() => { localStorage.removeItem('admin_token'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg hover:bg-rose-600/80 bg-white/10">
            <MdLogout className="text-2xl" />
            Logout
          </Link>
        </div>
      </aside>
      {/* Sidebar toggle button for mobile */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-800 text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}