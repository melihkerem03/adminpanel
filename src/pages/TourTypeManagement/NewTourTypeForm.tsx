import React, { useState } from 'react';
import { X, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TourTypeSettings {
  id: string;
  type: string;
  type_icon_svg: string;
  header_title: string;
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
}

interface NewTourTypeFormProps {
  tourType: TourTypeSettings | null;
  onClose: () => void;
  onSave: () => void;
}

const NewTourTypeForm: React.FC<NewTourTypeFormProps> = ({ tourType, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TourTypeSettings>(
    tourType || {
      id: '',
      type: '',
      type_icon_svg: '',
      header_title: '',
      hero_title: '',
      hero_subtitle: '',
      hero_description: '',
      hero_image_path: '',
      left_title: '',
      left_description: '',
      right_image_1: '',
      right_image_2: '',
      section_title: '',
      section_subtitle: ''
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // id boş ise sil, yeni kayıt için
      const dataToSave = { ...formData };
      if (!tourType) {
        delete dataToSave.id;
      }

      const { error } = await supabase
        .from('tour_type_settings')
        .upsert(dataToSave);

      if (error) throw error;
      onSave();
      onClose();
      alert('Tur tipi başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving tour type:', error);
      alert('Tur tipi kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File, field: keyof TourTypeSettings) => {
    try {
      if (!file) return;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `tour-types/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setFormData(prev => ({
        ...prev,
        [field]: filePath
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Görsel yüklenirken bir hata oluştu');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {tourType ? 'Tur Tipini Düzenle' : 'Yeni Tur Tipi Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Temel Bilgiler */}
          <div className="space-y-4 border-b pb-6">
            <h4 className="font-medium text-lg">Temel Bilgiler</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tur Tipi</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value.toLowerCase() })}
                  placeholder="örn: caravan, bus, cruise"
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Header Başlık</label>
                <input
                  type="text"
                  value={formData.header_title}
                  onChange={(e) => setFormData({ ...formData, header_title: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">İkon (SVG)</label>
              <div className="mt-1 flex space-x-4">
                <textarea
                  value={formData.type_icon_svg}
                  onChange={(e) => setFormData({ ...formData, type_icon_svg: e.target.value })}
                  rows={4}
                  className="block w-2/3 border rounded-md shadow-sm p-2 font-mono text-sm"
                  placeholder="<svg>...</svg>"
                  required
                />
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Önizleme</label>
                  <div 
                    className="w-16 h-16 border border-gray-300 rounded-md flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: formData.type_icon_svg }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="space-y-4 border-b pb-6">
            <h4 className="font-medium text-lg">Hero Section</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Başlık</label>
                <input
                  type="text"
                  value={formData.hero_title}
                  onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alt Başlık</label>
                <input
                  type="text"
                  value={formData.hero_subtitle}
                  onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                value={formData.hero_description}
                onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero Görseli</label>
              {formData.hero_image_path && (
                <div className="mt-2 mb-4">
                  <img
                    src={supabase.storage.from('site-images').getPublicUrl(formData.hero_image_path).data.publicUrl}
                    alt="Hero"
                    className="h-32 w-auto object-cover rounded-lg"
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

          {/* Sol Kolon */}
          <div className="space-y-4 border-b pb-6">
            <h4 className="font-medium text-lg">Sol Kolon</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700">Başlık</label>
              <input
                type="text"
                value={formData.left_title}
                onChange={(e) => setFormData({ ...formData, left_title: e.target.value })}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                value={formData.left_description}
                onChange={(e) => setFormData({ ...formData, left_description: e.target.value })}
                rows={4}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>

          {/* Sağ Kolon Görselleri */}
          <div className="space-y-4 border-b pb-6">
            <h4 className="font-medium text-lg">Sağ Kolon Görselleri</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">1. Görsel</label>
                {formData.right_image_1 && (
                  <div className="mt-2 mb-4">
                    <img
                      src={supabase.storage.from('site-images').getPublicUrl(formData.right_image_1).data.publicUrl}
                      alt="Right 1"
                      className="h-32 w-auto object-cover rounded-lg"
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
                <label className="block text-sm font-medium text-gray-700">2. Görsel</label>
                {formData.right_image_2 && (
                  <div className="mt-2 mb-4">
                    <img
                      src={supabase.storage.from('site-images').getPublicUrl(formData.right_image_2).data.publicUrl}
                      alt="Right 2"
                      className="h-32 w-auto object-cover rounded-lg"
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

          {/* Alt Section */}
          <div className="space-y-4 border-b pb-6">
            <h4 className="font-medium text-lg">Alt Section</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Başlık</label>
                <input
                  type="text"
                  value={formData.section_title}
                  onChange={(e) => setFormData({ ...formData, section_title: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alt Başlık</label>
                <input
                  type="text"
                  value={formData.section_subtitle}
                  onChange={(e) => setFormData({ ...formData, section_subtitle: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Butonları */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Kaydediliyor...' : tourType ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTourTypeForm; 