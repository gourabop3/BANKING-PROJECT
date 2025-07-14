import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdDashboard, MdPeople, MdAttachMoney, MdLocalOffer, MdLogout } from 'react-icons/md';
import { FaListUl } from 'react-icons/fa';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: MdDashboard },
  { href: '/admin/users', label: 'Users', Icon: MdPeople },
  { href: '/admin/loans', label: 'Loans', Icon: MdAttachMoney },
  { href: '/admin/discounts', label: 'Discounts', Icon: MdLocalOffer },
  { href: '/admin/recharge-plans', label: 'Recharge Plans', Icon: FaListUl },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-gradient-to-b from-blue-800 to-purple-700 shadow-xl h-screen p-6 flex flex-col text-white">
      <div className="mb-10 font-extrabold text-2xl tracking-tight flex items-center gap-2">
        <MdDashboard className="text-3xl" />
        Bank Admin
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg hover:bg-blue-600/70 ${pathname === href ? 'bg-white/20 shadow text-yellow-300' : ''}`}
              >
                <Icon className="text-2xl" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-10">
        <Link href="/admin-login" onClick={() => { localStorage.removeItem('admin_token'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-lg hover:bg-rose-600/80 bg-white/10">
          <MdLogout className="text-2xl" />
          Logout
        </Link>
      </div>
    </aside>
  );
}