'use client';

import { ChevronDown, Search, Settings } from "lucide-react";
import { useState } from "react";
import { UserDropdown } from "./UserDropdown";
import { useRouter } from "next/navigation";

interface HeaderProps {
    user: { name: string | null };
  }
  
  export const Header: React.FC<HeaderProps> = ({ user }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();
  
    const handleChangePin = () => {
      router.push('/change-pin');
      setIsDropdownOpen(false);
    };
  
    const handleLogout = () => {
      // Implement logout logic
      localStorage.removeItem('token');
      router.push('/login');
    };
  
    return (
      <header className="bg-white border-b p-4 relative">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="search"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4 relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <span className="font-medium">{user?.name || 'User'}</span>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isDropdownOpen && (
              <UserDropdown
                onChangePin={handleChangePin}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </header>
    );
  };