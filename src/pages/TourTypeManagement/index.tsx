import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import NewTourTypeForm from './NewTourTypeForm';

interface TourTypeSettings {
  id: string;
  type: string;               // caravan, bus, cruise vb.
  type_icon_svg: string;      // SVG formatında ikon
  header_title: string;       // Üst başlık
  hero_title: string;         // Hero başlık
  hero_subtitle: string;      // Hero alt başlık
  hero_description: string;   // Hero açıklama
  hero_image_path: string;    // Hero görsel yolu
  left_title: string;         // Sol kolon başlık
  left_description: string;   // Sol kolon açıklama
  right_image_1: string;      // Sağ kolon 1. görsel
  right_image_2: string;      // Sağ kolon 2. görsel
  features: {                 // Özellikler listesi
    title: string;
    items: string[];
  }[];
}

const TourTypeManagement = () => {
  const [tourTypes, setTourTypes] = useState<TourTypeSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<TourTypeSettings | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTourTypes();
  }, []);

  const loadTourTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tour_type_settings')
        .select('*')
        .order('type');

      if (error) throw error;
      setTourTypes(data || []);
    } catch (error) {
      console.error('Error loading tour types:', error);
      alert('Tur tipleri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu tur tipini silmek istediğinizden emin misiniz?')) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('tour_type_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadTourTypes();
      alert('Tur tipi başarıyla silindi');
    } catch (error) {
      console.error('Error deleting tour type:', error);
      alert('Tur tipi silinirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tur Tipi Yönetimi</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingType(null);
              setIsFormOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Tur Tipi
          </button>
        </div>
      </div>

      {/* Arama ve Liste */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tur tipi ara..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tourTypes
              .filter(type => 
                type.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.header_title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((tourType) => (
                <div key={tourType.id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-10 h-10 mr-3"
                      dangerouslySetInnerHTML={{ __html: tourType.type_icon_svg }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{tourType.header_title}</h3>
                      <p className="text-sm text-gray-500">{tourType.type}</p>
                    </div>
                  </div>
                  <div className="relative h-40 mb-4">
                    <img
                      src={supabase.storage.from('site-images').getPublicUrl(tourType.hero_image_path).data.publicUrl}
                      alt={tourType.type}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingType(tourType);
                        setIsFormOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tourType.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <NewTourTypeForm
          tourType={editingType}
          onClose={() => {
            setIsFormOpen(false);
            setEditingType(null);
          }}
          onSave={loadTourTypes}
        />
      )}
    </div>
  );
};

export default TourTypeManagement;