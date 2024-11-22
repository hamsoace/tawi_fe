'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: Menu, link: '/dashboard' },
    // { label: 'Activity', icon: Activity, link: '/dashboard/activity' },
    // { label: 'Settings', icon: Settings, link: '/dashboard/settings' },
    { label: 'Recharge', icon: Menu, link: '/dashboard/recharge' },
    { label: 'Bulk Recharge', icon: Menu, link: '/dashboard/bulkrecharge' },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen p-4">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg" />
        <span className="font-bold text-xl">Tawi Pinless</span>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            href={item.link}
            key={item.label}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              pathname === item.link
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};