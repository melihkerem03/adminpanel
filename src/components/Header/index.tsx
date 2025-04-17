import React from 'react';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <button 
          className="text-gray-500 focus:outline-none md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-700">Kontrol Paneli</h1>
      </div>
      <div className="flex items-center">
        <button className="relative p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="relative ml-4">
          <div className="flex items-center">
            <img
              className="w-8 h-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="User avatar"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Admin Kullanıcı</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;