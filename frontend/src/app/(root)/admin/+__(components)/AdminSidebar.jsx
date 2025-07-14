import Link from 'next/link';
const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  // ...other links
];
export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white shadow h-screen p-4 flex flex-col">
      <div className="mb-8 font-bold text-xl">Bank Admin</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="block px-3 py-2 rounded hover:bg-blue-100">{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}