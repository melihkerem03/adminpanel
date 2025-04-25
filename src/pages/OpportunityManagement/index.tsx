import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Calendar, Image, Settings, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tour {
  id: string;
  title: string;
  region: string;
  duration: string;
  base_price: number;
  short_description: string;
  hero_image_path: string;
  opportunity_tour: boolean;
}

interface OpportunitySettings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_image_path: string;
  left_title: string;
  left_description: string;
  right_image_1: string;
  right_image_2: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
}

const OpportunityManagement = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [settings, setSettings] = useState<OpportunitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSettings, setEditingSettings] = useState<OpportunitySettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Turları yükle
      const { data: toursData, error: toursError } = await supabase
        .from('tours')
        .select('id, title, region, duration, base_price, short_description, hero_image_path, opportunity_tour')
        .order('title');

      if (toursError) throw toursError;
      setTours(toursData || []);

      // Ayarları yükle
      const { data: settingsData, error: settingsError } = await supabase
        .from('opportunity_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      setSettings(settingsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpportunityStatusChange = async (tourId: string, status: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('tours')
        .update({ opportunity_tour: status })
        .eq('id', tourId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error updating tour status:', error);
      alert('Durum güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSettings) return;

    try {
      setIsLoading(true);
      
      console.log("Kaydedilecek ayarlar:", editingSettings);
      
      // ID'nin doğru şekilde kullanıldığından emin olalım
      const dataToSave = {
        ...editingSettings,
        updated_at: new Date().toISOString()
      };
      
      // Eğer yeni kayıt oluşturuluyorsa, created_at ekleyelim
      if (!dataToSave.id) {
        dataToSave.created_at = new Date().toISOString();
      }
      
      // Tüm gerekli alanların dolu olduğundan emin olalım
      const requiredFields = [
        'hero_title', 'hero_subtitle', 'hero_description', 'hero_image_path',
        'left_title', 'left_description', 'right_image_1', 'right_image_2',
        'section_title', 'section_subtitle', 'section_description'
      ];
      
      const missingFields = requiredFields.filter(field => !dataToSave[field]);
      if (missingFields.length > 0) {
        throw new Error(`Lütfen tüm zorunlu alanları doldurun: ${missingFields.join(', ')}`);
      }

      // Veriyi kaydet (upsert ile hem güncelleme hem de yeni kayıt yapmayı destekler)
      const { data, error } = await supabase
        .from('opportunity_settings')
        .upsert(dataToSave, { 
          onConflict: 'id',
          returning: 'representation' // Kaydedilen veriyi geri döndür
        });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Kaydedilen veri:", data);
      
      // State'i güncelle
      await loadData();
      setIsSettingsModalOpen(false);
      alert('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Ayarlar kaydedilirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File, field: keyof OpportunitySettings) => {
    try {
      if (!file) return;
      
      // Dosya boyutu kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Dosya boyutu çok büyük (maksimum 10MB)');
      }
      
      // Dosya uzantısı kontrolü
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        throw new Error('Geçersiz dosya türü. Sadece jpg, jpeg, png, gif ve webp kabul edilir.');
      }
      
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `opportunity/${fileName}`;

      // Önce dosya varlığını kontrol edelim
      console.log(`Dosya yükleniyor: ${filePath}`);
      
      const { error: uploadError, data } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Aynı adla bir dosya varsa üzerine yaz
        });

      if (uploadError) {
        console.error("Yükleme hatası:", uploadError);
        throw uploadError;
      }

      console.log("Dosya başarıyla yüklendi:", data);

      // State'i güncelle
      setEditingSettings(prev => {
        if (!prev) return null;
        
        const updatedSettings = {
          ...prev,
          [field]: filePath
        };
        
        console.log(`${field} alanı güncellendi:`, updatedSettings);
        return updatedSettings;
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Görsel yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fırsat Yönetimi</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingSettings(settings);
              setIsSettingsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Settings className="w-5 h-5 mr-2" />
            Sayfa Ayarları
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              placeholder="Tur ara..."
            />
          </div>
        </div>

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
                  Fiyat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours
                .filter(tour => 
                  tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  tour.region.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((tour) => (
                  <tr key={tour.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tour.title}</div>
                          <div className="text-sm text-gray-500">{tour.short_description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour.base_price.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleOpportunityStatusChange(tour.id, !tour.opportunity_tour)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tour.opportunity_tour
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tour.opportunity_tour ? 'Fırsat Turu' : 'Normal Tur'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfa Ayarları Modal */}
      {isSettingsModalOpen && editingSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Fırsat Sayfası Ayarları</h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettingsSave} className="space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Hero Section Ayarları */}
              <div className="space-y-4 border-b pb-6">
                <h4 className="font-medium text-lg">Hero Section</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Başlık</label>
                    <input
                      type="text"
                      value={editingSettings.hero_title}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        hero_title: e.target.value
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alt Başlık</label>
                    <input
                      type="text"
                      value={editingSettings.hero_subtitle}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        hero_subtitle: e.target.value
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={editingSettings.hero_description}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      hero_description: e.target.value
                    })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Görseli</label>
                  {editingSettings.hero_image_path && (
                    <div className="mb-2">
                      <img
                        src={supabase.storage.from('site-images').getPublicUrl(editingSettings.hero_image_path).data.publicUrl}
                        alt="Hero"
                        className="h-32 w-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'hero_image_path');
                    }}
                    className="mt-1 block w-full"
                  />
                </div>
              </div>

              {/* Sol Kolon Ayarları */}
              <div className="space-y-4 border-b pb-6">
                <h4 className="font-medium text-lg">Sol Kolon</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlık</label>
                  <input
                    type="text"
                    value={editingSettings.left_title}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      left_title: e.target.value
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={editingSettings.left_description}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      left_description: e.target.value
                    })}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
              </div>

              {/* Sağ Kolon Görselleri */}
              <div className="space-y-4 border-b pb-6">
                <h4 className="font-medium text-lg">Sağ Kolon Görselleri</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Görsel</label>
                    {editingSettings.right_image_1 && (
                      <div className="mb-2">
                        <img
                          src={supabase.storage.from('site-images').getPublicUrl(editingSettings.right_image_1).data.publicUrl}
                          alt="Right 1"
                          className="h-32 w-auto object-cover rounded-md"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'right_image_1');
                      }}
                      className="mt-1 block w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. Görsel</label>
                    {editingSettings.right_image_2 && (
                      <div className="mb-2">
                        <img
                          src={supabase.storage.from('site-images').getPublicUrl(editingSettings.right_image_2).data.publicUrl}
                          alt="Right 2"
                          className="h-32 w-auto object-cover rounded-md"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'right_image_2');
                      }}
                      className="mt-1 block w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Alt Section Ayarları */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Alt Section</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Başlık</label>
                    <input
                      type="text"
                      value={editingSettings.section_title}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        section_title: e.target.value
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alt Başlık</label>
                    <input
                      type="text"
                      value={editingSettings.section_subtitle}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        section_subtitle: e.target.value
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={editingSettings.section_description}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      section_description: e.target.value
                    })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityManagement;