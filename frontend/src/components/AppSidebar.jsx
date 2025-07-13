"use client";
import Link from 'next/link';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { MdDashboard, MdIntegrationInstructions } from 'react-icons/md';
import { GrCurrency } from 'react-icons/gr';
import { MdTransferWithinAStation, MdPhoneAndroid, MdQrCode } from 'react-icons/md';
import { GiReceiveMoney, GiFalloutShelter } from 'react-icons/gi';
import { IoCardSharp } from 'react-icons/io5';
import { PiNewspaperClipping } from 'react-icons/pi';
import { FaKey } from 'react-icons/fa';
import { AiOutlineRobot, AiOutlineInfoCircle } from 'react-icons/ai';

const links = [
  { href: '/', label: 'Home', Icon: MdDashboard },
  { href: '/amount', label: 'Account', Icon: GrCurrency },
  { href: '/transfer', label: 'Transfer', Icon: MdTransferWithinAStation },
  { href: '/recharge', label: 'Mobile & Bills', Icon: MdPhoneAndroid },
  { href: '/upi', label: 'UPI', Icon: MdQrCode },
  { href: '/fd-amount', label: 'Fix Deposit', Icon: GiReceiveMoney },
  { href: '/transactions', label: 'Transactions', Icon: PiNewspaperClipping },
  { href: '/atm-cards', label: 'ATM Cards', Icon: IoCardSharp },
  { href: '/api-keys', label: 'API Keys', Icon: FaKey },
  { href: '/api-use', label: 'API Use', Icon: MdIntegrationInstructions },
  { href: '/customer-service', label: 'Customer Service', Icon: AiOutlineRobot },
  { href: '/about', label: 'About', Icon: AiOutlineInfoCircle },
  { href: '/profile', label: 'Profile', Icon: GiFalloutShelter },
];

export default function AppSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={clsx(
          'app-sidebar transform transition-transform duration-300 z-40',
          'fixed top-0 left-0 h-full w-64',
          'bg-white border-r border-gray-200',
          'lg:block',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{
          // Fallback styles for better browser compatibility
          backgroundColor: 'var(--sidebar, #ffffff)',
          color: 'var(--sidebar-foreground, #1a202c)',
          borderRightColor: 'var(--sidebar-border, #e2e8f0)',
        }}
      >
      <nav className="py-10 space-y-2">
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={clsx(
              'mx-3 flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
              pathname === href
                ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
                : 'hover:bg-[var(--sidebar-accent)]'
            )}
          >
            <Icon className="text-xl" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
    </>
  );
}