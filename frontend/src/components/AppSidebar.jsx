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
import { useMainContext } from '@/context/MainContext';

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
  const { user } = useMainContext();

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
          'flex flex-col',
          'lg:block',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{
          backgroundColor: 'var(--sidebar, #ffffff)',
          color: 'var(--sidebar-foreground, #1a202c)',
          borderRightColor: 'var(--sidebar-border, #e2e8f0)',
        }}
      >
        <div className="flex-1 overflow-y-auto">
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
        </div>
        {/* Profile section pinned to bottom */}
        <div className="p-4 border-t mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          {user ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-2">
                {user.fullName ? user.fullName[0] : user.email[0]}
              </div>
              <div className="font-bold text-lg">{user.fullName || 'User'}</div>
              <div className="text-xs opacity-80 mb-1">{user.email}</div>
              <div className="flex gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  ✓ Verified
                </span>
                {user.kyc_status === 'completed' || user.kyc_status === 'approved' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    ✓ KYC Verified
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="text-center text-xs opacity-80">Not logged in</div>
          )}
        </div>
      </aside>
    </>
  );
}