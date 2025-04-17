import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  BarChart2, 
  Calendar, 
  Settings, 
  LogOut,
  Map,
  Compass,
  Tag,
  Briefcase,
  Layout,
  Info,
  Globe
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  const menuItems = [
    { path: '/dashboard', icon: <Home className="w-5 h-5 mr-3" />, label: 'Ana Sayfa' },
    { path: '/homepage-management', icon: <Layout className="w-5 h-5 mr-3" />, label: 'Ana Sayfa Yönetimi' },
    { path: '/tours-management', icon: <Compass className="w-5 h-5 mr-3" />, label: 'Tur Yönetimi' },
    { path: '/tour-type-management', icon: <Tag className="w-5 h-5 mr-3" />, label: 'Tur Tipi Yönetimi' },
    { path: '/destination-management', icon: <Map className="w-5 h-5 mr-3" />, label: 'Destinasyon Yönetimi' },
    { path: '/opportunity-management', icon: <Calendar className="w-5 h-5 mr-3" />, label: 'Fırsat Yönetimi' },
    { path: '/blog-management', icon: <FileText className="w-5 h-5 mr-3" />, label: 'Blog Yönetimi' },
    { path: '/about-us-management', icon: <Info className="w-5 h-5 mr-3" />, label: 'Hakkımızda Yönetimi' },
    { path: '/users', icon: <Users className="w-5 h-5 mr-3" />, label: 'Kullanıcılar' },
    { path: '/statistics', icon: <BarChart2 className="w-5 h-5 mr-3" />, label: 'İstatistikler' },
    { path: '/settings', icon: <Settings className="w-5 h-5 mr-3" />, label: 'Ayarlar' },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center h-16 px-4 bg-gray-900">
        <Globe className="w-6 h-6 text-white mr-2" />
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
      </div>
      <div className="flex flex-col flex-grow px-4 py-4">
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive(item.path)
                  ? 'text-white bg-gray-700'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="pt-4 mt-6 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;