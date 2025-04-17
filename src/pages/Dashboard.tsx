import React from 'react';
import { LogOut, Home, Users, Settings, BarChart2, Calendar, FileText, Bell } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-800">
          <div className="flex items-center h-16 px-4 bg-gray-900">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>
          <div className="flex flex-col flex-grow px-4 py-4">
            <nav className="flex-1 space-y-2">
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md">
                <Home className="w-5 h-5 mr-3" />
                Ana Sayfa
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                <Users className="w-5 h-5 mr-3" />
                Kullanıcılar
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                <FileText className="w-5 h-5 mr-3" />
                Raporlar
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                <BarChart2 className="w-5 h-5 mr-3" />
                İstatistikler
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                <Calendar className="w-5 h-5 mr-3" />
                Takvim
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                <Settings className="w-5 h-5 mr-3" />
                Ayarlar
              </a>
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
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button className="text-gray-500 focus:outline-none md:hidden">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Toplam Kullanıcı</h2>
                  <p className="text-2xl font-semibold text-gray-800">1,257</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-500">+12%</span>
                  <span className="ml-2 text-sm font-medium text-gray-500">Geçen aydan</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <BarChart2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Toplam Gelir</h2>
                  <p className="text-2xl font-semibold text-gray-800">₺24,780</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-500">+8%</span>
                  <span className="ml-2 text-sm font-medium text-gray-500">Geçen aydan</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Yeni Siparişler</h2>
                  <p className="text-2xl font-semibold text-gray-800">89</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-red-500">-2%</span>
                  <span className="ml-2 text-sm font-medium text-gray-500">Geçen haftadan</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Bildirimler</h2>
                  <p className="text-2xl font-semibold text-gray-800">12</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-500">+10%</span>
                  <span className="ml-2 text-sm font-medium text-gray-500">Geçen haftadan</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-700">Son Aktiviteler</h2>
            <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Ayşe Yılmaz</div>
                          <div className="text-sm text-gray-500">ayse@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Yeni sipariş oluşturuldu</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Tamamlandı
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      20 Nisan 2025
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Mehmet Kaya</div>
                          <div className="text-sm text-gray-500">mehmet@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Profil güncellendi</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Tamamlandı
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      19 Nisan 2025
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Zeynep Demir</div>
                          <div className="text-sm text-gray-500">zeynep@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Ödeme işlemi</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        İşlemde
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      18 Nisan 2025
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;