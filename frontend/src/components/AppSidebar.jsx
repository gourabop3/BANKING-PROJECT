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
import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaGithub, FaTelegram, FaInstagram, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { SiExpress, SiVite, SiMongodb, SiVercel, SiTailwindcss } from 'react-icons/si';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home', Icon: MdDashboard },
  { href: '/amount', label: 'Account', Icon: GrCurrency },
  { href: '/transfer', label: 'Transfer', Icon: MdTransferWithinAStation },
  { href: '/recharge', label: 'Mobile & Bills', Icon: MdPhoneAndroid },
  { href: '/upi', label: 'UPI', Icon: MdQrCode },
  { href: '/fd-amount', label: 'Fix Deposit', Icon: GiReceiveMoney },
  { href: '/transactions', label: 'Transactions', Icon: PiNewspaperClipping },
  { href: '/atm-cards', label: 'ATM Cards', Icon: IoCardSharp },
  { href: '/customer-service', label: 'Customer Service', Icon: AiOutlineRobot },
  { href: '/about', label: 'About', Icon: AiOutlineInfoCircle },
  { href: '/profile', label: 'Profile', Icon: GiFalloutShelter },
];

const skills = [
  { name: 'HTML', icon: FaHtml5, color: '#e34c26', desc: 'Markup language for the web.' },
  { name: 'CSS', icon: FaCss3Alt, color: '#1572B6', desc: 'Styling for web pages.' },
  { name: 'JavaScript', icon: FaJs, color: '#f7df1e', desc: 'Programming language of the web.' },
  { name: 'React', icon: FaReact, color: '#61dafb', desc: 'UI library for building interfaces.' },
  { name: 'Node.js', icon: FaNodeJs, color: '#3c873a', desc: 'JavaScript runtime for backend.' },
  { name: 'Express.js', icon: SiExpress, color: '#000', desc: 'Web framework for Node.js.' },
  { name: 'Vite', icon: SiVite, color: '#646cff', desc: 'Next generation frontend tooling.' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47A248', desc: 'NoSQL database.' },
  { name: 'Vercel', icon: SiVercel, color: '#000', desc: 'Cloud platform for static sites.' },
  { name: 'GitHub', icon: FaGithub, color: '#000', desc: 'Code hosting platform.' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#38bdf8', desc: 'Utility-first CSS framework.' },
];

function SkillsGrid() {
  const [active, setActive] = useState(null);
  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {skills.map((skill, i) => {
          const Icon = skill.icon;
          const isActive = active === i;
          return (
            <button
              key={skill.name}
              className={`flex flex-col items-center p-2 rounded-lg shadow transition-all focus:outline-none
                ${isActive ? 'bg-blue-50 border-2 border-blue-400 scale-105' : 'bg-white'}
                hover:scale-110 hover:shadow-lg active:scale-95
              `}
              style={{ color: skill.color, transition: 'all 0.18s cubic-bezier(.4,2,.6,1)' }}
              onClick={() => setActive(i)}
              tabIndex={0}
              aria-pressed={isActive}
            >
              <Icon className="text-2xl sm:text-3xl" />
              <span className="text-xs mt-1 font-medium">{skill.name}</span>
            </button>
          );
        })}
      </div>
      {active !== null && (
        <div className="mt-3 text-center text-sm text-gray-700 min-h-[32px] animate-fade-in transition-opacity duration-300 opacity-100">
          <b>{skills[active].name}:</b> {skills[active].desc}
        </div>
      )}
    </div>
  );
}

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
      </aside>
    </>
  );
}