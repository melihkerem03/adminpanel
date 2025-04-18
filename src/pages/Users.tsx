import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Edit, Trash2, Search, Filter, MoreVertical, UserPlus, Building, MapPin, Phone } from 'lucide-react';
import AddAcentaModal from './UserManagement/AddAcentaModal';

interface AcentaData {
  id: string;
  user_id?: string;
  acenta_ismi: string;
  telefon?: string;
  mobil_telefon?: string;
  ulke?: string;
  sehir?: string;
  adres?: string;
  cinsiyet?: string;
  isim: string;
  soyisim: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

const Users: React.FC = () => {
  const [acentalar, setAcentalar] = useState<AcentaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedAcenta, setSelectedAcenta] = useState<AcentaData | null>(null);

  useEffect(() => {
    fetchAcentalar();
  }, []);

  const fetchAcentalar = async () => {
    try {
      setIsLoading(true);
      // Supabase'den acentaları çek
      const { data, error } = await supabase
        .from('acentalar')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAcentalar(data || []);
    } catch (error) {
      console.error('Acentalar yüklenirken hata:', error);
      alert('Acentalar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrelenmiş acentaları göster
  const filteredAcentalar = acentalar.filter(acenta => 
    acenta.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acenta.isim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acenta.soyisim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acenta.acenta_ismi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    fetchAcentalar();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Acenta Yönetimi</h1>
        <button 
          onClick={() => setIsAddUserModalOpen(true)}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Yeni Acenta
        </button>
      </div>

      {/* Arama ve filtreleme */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Acenta ara..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="ml-4 p-2 text-gray-500 rounded-md hover:bg-gray-100">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Acenta tablosu */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-500">Acentalar yükleniyor...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acenta / Temsilci
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim Bilgileri
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Konum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAcentalar.map(acenta => (
                <tr key={acenta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {/* Avatar placeholder */}
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Building className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {acenta.acenta_ismi}
                        </div>
                        <div className="text-sm text-gray-500">
                          {acenta.isim} {acenta.soyisim}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{acenta.email}</div>
                    <div className="text-sm text-gray-500">
                      {acenta.telefon && <span className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {acenta.telefon}</span>}
                      {acenta.mobil_telefon && <span className="flex items-center mt-1"><Phone className="h-3 w-3 mr-1" /> {acenta.mobil_telefon}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {acenta.sehir && acenta.ulke 
                        ? `${acenta.sehir}, ${acenta.ulke}`
                        : acenta.sehir || acenta.ulke || 'Belirtilmemiş'}
                    </div>
                    {acenta.adres && (
                      <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                        {acenta.adres}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(acenta.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedAcenta(acenta);
                          setIsAddUserModalOpen(true);
                        }} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Bu acentayı silmek istediğinize emin misiniz?')) {
                            // Silme işlemi
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Acenta sayısı bilgisi */}
      <div className="mt-4 text-sm text-gray-500">
        Toplam {filteredAcentalar.length} acenta
      </div>

      {/* Yeni Acenta Ekleme/Düzenleme modalı burada gelecek */}
      {isAddUserModalOpen && (
        <AddAcentaModal 
          onClose={() => {
            setIsAddUserModalOpen(false);
            setSelectedAcenta(null);
          }}
          onSave={handleSave}
          acenta={selectedAcenta}
        />
      )}
    </div>
  );
};

export default Users;