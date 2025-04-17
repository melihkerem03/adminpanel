import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import NewTourForm from './NewTourForm';

interface Tour {
  id: string;
  slug: string;
  title: string;
  region: string;
  duration: string;
  base_price: number;
  short_description: string;
  long_description: string;
  hero_image_path: string;
  tour_type_id: string;
  tour_type: {
    id: string;
    type: string;
    header_title: string;
  };
}

const ToursManagement = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTourFormOpen, setIsNewTourFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dailyPrograms, setDailyPrograms] = useState([]);
  const [datesPrices, setDatesPrices] = useState([]);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          tour_type:tour_type_id (
            id,
            type,
            header_title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours(data || []);

      // Günlük programları yükle
      if (currentTour) {
        const { data: programsData, error: programsError } = await supabase
          .from('tour_daily_programs')
          .select('*')
          .eq('tour_id', currentTour.id)
          .order('day_range');

        if (programsError) throw programsError;
        setDailyPrograms(programsData || []);
      }

      // Tarih ve fiyatları yükle
      if (currentTour) {
        const { data: datesPricesData, error: datesPricesError } = await supabase
          .from('tour_dates_prices')
          .select('*')
          .eq('tour_id', currentTour.id);

        if (datesPricesError) throw datesPricesError;
        setDatesPrices(datesPricesData || []);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
      alert('Turlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!window.confirm('Bu turu silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', tourId);

      if (error) throw error;
      loadTours();
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
  };

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || tour.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const regions = Array.from(new Set(tours.map(tour => tour.region)));

  // Görsel URL'ini oluşturan yardımcı fonksiyon
  const getImageUrl = (path: string | null): string => {
    if (!path) return '/placeholder.jpg';
    return supabase.storage
      .from('site-images')
      .getPublicUrl(path)
      .data.publicUrl;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tur Yönetimi</h1>
        <button 
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          onClick={() => {
            setCurrentTour(null);
            setIsEditMode(false);
            setIsNewTourFormOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Tur
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              placeholder="Tur ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">Tüm Bölgeler</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tur Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bölge
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Süre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlangıç Fiyatı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTours.map((tour) => (
                  <tr key={tour.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tour.title}</div>
                          <div className="text-sm text-gray-500">{tour.short_description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tour.region}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tour.duration}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₺{tour.base_price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            setCurrentTour(tour);
                            setIsEditMode(true);
                            setIsNewTourFormOpen(true);
                          }}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteTour(tour.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <a 
                          href={`/tours/${tour.slug}`} 
                          target="_blank" 
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isNewTourFormOpen && (
        <NewTourForm 
          onClose={() => {
            setIsNewTourFormOpen(false);
            setCurrentTour(null);
            setIsEditMode(false);
          }}
          tour={currentTour}
          isEditMode={isEditMode}
          onSuccess={() => {
            setIsNewTourFormOpen(false);
            setCurrentTour(null);
            setIsEditMode(false);
            loadTours();
          }}
        />
      )}
    </div>
  );
};

export default ToursManagement;