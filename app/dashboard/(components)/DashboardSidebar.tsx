'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, Settings, X } from 'lucide-react';
import logo from '../../../assets/logo.png';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: Menu, link: '/dashboard' },
    { label: 'Recharge', icon: Menu, link: '/dashboard/recharge' },
    { label: 'Bulk Recharge', icon: Menu, link: '/dashboard/bulkrecharge' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const MobileMenuToggle = () => (
    <Button 
      variant="ghost" 
      className="md:hidden fixed top-4 left-4 z-50" 
      onClick={toggleMobileMenu}
    >
      {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-8 p-4">
        <Image
          src={logo}
          width={24}
          height={24}
          alt="Tawi Logo"
          className="w-6 h-6 object-contain"
        />
        <span className="font-bold text-xl">Tawi Pinless</span>
      </div>

      <nav className="space-y-2 px-4">
        {navItems.map((item) => (
          <Link
            href={item.link}
            key={item.label}
            className={`flex items-center space-x-2 w-full p-2 rounded-lg ${
              pathname === item.link
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <MobileMenuToggle />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        >
          <div 
            className="bg-white w-64 h-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};