import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image, Calendar, MapPin, DollarSign, Sun, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase, STORAGE_BUCKETS, IMAGE_TYPES, PRICE_CATEGORIES } from '@/lib/supabase';
import type { 
  Tour, 
  TourImage, 
  TourHighlight, 
  TourInclusion,
  TourTip,
  TourDailyProgram,
  TourDatePrice,
  TourWeatherData 
} from '@/types/tour';

interface NewTourFormProps {
  onClose: () => void;
  onSuccess: () => void;
  tour?: Tour | null;
  isEditMode?: boolean;
}

interface TourTypeSettings {
  id: string;
  type: string;
  header_title: string;
  // ... diğer alanlar gerekirse eklenebilir
}

const MONTHS = [
  'JAN', 'FEB', 'MAA', 'APR', 'MEI', 'JUN',
  'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'
];

// Tip tanımlamaları
interface ImageUploadState {
  file: File | null;
  preview: string;
  uploading: boolean;
  error: string | null;
}

interface DailyProgram {
  id?: string;
  tour_id?: string;
  day_range: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface TourDatePrice {
  id?: string;
  tour_id?: string;
  travel_period: string;
  price_category: string;
  airline: string;
  price: number;
  currency: string;
  price_usd?: number;
  price_eur?: number;
  price_try?: number;
  created_at?: string;
}

interface TourFormData {
  title: string;
  slug: string;
  region: string;
  duration: string;
  base_price: number;
  base_price_currency: string;
  short_description: string;
  long_description: string;
  hero_image_path: string;
  tour_type_id: string;
  // Diğer gerekli alanlar
}

const NewTourForm: React.FC<NewTourFormProps> = ({
  onClose,
  onSuccess,
  tour,
  isEditMode = false
}) => {
  // Ana form state'i
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form verileri için state'ler
  const [formData, setFormData] = useState<TourFormData>({
    title: tour?.title || '',
    slug: tour?.slug || '',
    region: tour?.region || '',
    duration: tour?.duration || '',
    base_price: tour?.base_price || 0,
    base_price_currency: tour?.base_price_currency || 'USD',
    short_description: tour?.short_description || '',
    long_description: tour?.long_description || '',
    hero_image_path: tour?.hero_image_path || '',
    tour_type_id: tour?.tour_type_id || ''
  });

  // İlişkili veriler için state'ler
  const [images, setImages] = useState<Partial<TourImage>[]>([]);
  const [highlights, setHighlights] = useState<Partial<TourHighlight>[]>([]);
  const [inclusions, setInclusions] = useState<Partial<TourInclusion>[]>([]);
  const [tips, setTips] = useState<Partial<TourTip>[]>([]);
  const [dailyPrograms, setDailyPrograms] = useState<DailyProgram[]>([]);
  const [datesPrices, setDatesPrices] = useState<Partial<TourDatePrice>[]>([]);
  const [weatherData, setWeatherData] = useState<Partial<TourWeatherData>[]>([]);
  const [tourTypes, setTourTypes] = useState<TourTypeSettings[]>([]);

  // Düzenleme modunda tur verilerini yükle
  useEffect(() => {
    if (isEditMode && tour?.id) {
      loadTourData(tour.id);
    }
  }, [isEditMode, tour]);

  // Tur tiplerini yükle
  useEffect(() => {
    const loadTourTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('tour_type_settings')
          .select('id, type, header_title')
          .order('type');

        if (error) throw error;
        setTourTypes(data || []);
      } catch (error) {
        console.error('Error loading tour types:', error);
      }
    };

    loadTourTypes();
  }, []);

  const loadTourData = async (tourId: string) => {
    try {
      // Ana tur verilerini zaten prop olarak alıyoruz
      setFormData({
        title: tour?.title || '',
        slug: tour?.slug || '',
        region: tour?.region || '',
        duration: tour?.duration || '',
        base_price: tour?.base_price || 0,
        base_price_currency: tour?.base_price_currency || 'USD',
        short_description: tour?.short_description || '',
        long_description: tour?.long_description || '',
        hero_image_path: tour?.hero_image_path || '',
        tour_type_id: tour?.tour_type_id || ''
      });

      // Önemli noktaları yükle
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('tour_highlights')
        .select('*')
        .eq('tour_id', tourId)
        .order('display_order');

      if (highlightsError) throw highlightsError;
      setHighlights(highlightsData || []);

      // Dahil olanları yükle
      const { data: inclusionsData, error: inclusionsError } = await supabase
        .from('tour_inclusions')
        .select('*')
        .eq('tour_id', tourId)
        .order('display_order');

      if (inclusionsError) throw inclusionsError;
      setInclusions(inclusionsData || []);

      // İpuçlarını yükle
      const { data: tipsData, error: tipsError } = await supabase
        .from('tour_tips')
        .select('*')
        .eq('tour_id', tourId);

      if (tipsError) throw tipsError;
      setTips(tipsData || []);

      // Görselleri yükle
      const { data: imagesData, error: imagesError } = await supabase
        .from('tour_images')
        .select('*')
        .eq('tour_id', tourId)
        .order('display_order');

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Günlük programları yükle
      const { data: programsData, error: programsError } = await supabase
        .from('tour_daily_programs')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_range');

      if (programsError) throw programsError;
      setDailyPrograms(programsData || []);

      // Tarih ve fiyatları yükle
      const { data: datesPricesData, error: datesPricesError } = await supabase
        .from('tour_dates_prices')
        .select('*')
        .eq('tour_id', tourId)
        .order('travel_period');

      if (datesPricesError) throw datesPricesError;
      setDatesPrices(datesPricesData || []);

      // Hava durumu verilerini yükle
      const { data: weatherData, error: weatherError } = await supabase
        .from('tour_weather_data')
        .select('*')
        .eq('tour_id', tourId)
        .order('month');

      if (weatherError) throw weatherError;

      // Verileri yüklerken ay isimlerini standardize edelim
      const standardizedWeatherData = (weatherData || []).map(data => ({
        ...data,
        month: data.month.toUpperCase().substring(0, 3) // Ay isimlerini 3 harfli formata çevirelim
      }));

      setWeatherData(standardizedWeatherData);

    } catch (error) {
      console.error('Error loading tour data:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Sayısal değerleri doğru şekilde dönüştür
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Slug oluşturma yardımcı fonksiyonu
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Görsel yükleme ve yönetim fonksiyonları
  const uploadImage = async (file: File, type: 'hero' | 'gallery' | 'map'): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('site-images')
        .upload(`tour-images/${filePath}`, file);

      if (uploadError) throw uploadError;

      console.log('Upload successful:', filePath);
      return `tour-images/${filePath}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageUpload = async (file: File, type: 'hero' | 'gallery' | 'map') => {
    try {
      const storagePath = await uploadImage(file, type);

      // Hero görsel için form datasını güncelle
      if (type === 'hero') {
        setFormData(prev => ({
          ...prev,
          hero_image_path: storagePath
        }));
      } else {
        // Galeri veya harita görseli için images state'ini güncelle
        setImages(prev => [...prev, {
          storage_path: storagePath,
          image_type: type,
          alt_text: file.name,
          display_order: prev.length + 1
        }]);
      }

      console.log(`${type} image uploaded successfully:`, storagePath);
    } catch (error) {
      console.error('Error handling image upload:', error);
      alert('Görsel yüklenirken bir hata oluştu');
    }
  };

  const handleImageDelete = async (imageId: string, type: 'hero' | 'gallery' | 'map') => {
    try {
      if (type === 'hero') {
        // Hero görseli sil
        if (formData.hero_image_path) {
          await supabase.storage
            .from('site-images')
            .remove([formData.hero_image_path]);
          
          setFormData(prev => ({ ...prev, hero_image_path: '' }));
        }
      } else {
        // Galeri veya harita görselini sil
        const imageToDelete = images.find(img => img.id === imageId);
        if (imageToDelete?.storage_path) {
          // Storage'dan sil
          await supabase.storage
            .from('site-images')
            .remove([imageToDelete.storage_path]);

          // State'den sil
          setImages(prev => prev.filter(img => img.id !== imageId));

          // Veritabanından sil (eğer kayıtlı ise)
          if (imageToDelete.id) {
            await supabase
              .from('tour_images')
              .delete()
              .eq('id', imageToDelete.id);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Görsel silinirken bir hata oluştu');
    }
  };

  // Görsel URL'lerini alma yardımcı fonksiyonu
  const getImageUrl = (path: string): string => {
    if (!path) return '';
    return supabase.storage
      .from('site-images')
      .getPublicUrl(path)
      .data.publicUrl;
  };

  // Para birimi değişikliği için yardımcı fonksiyon
  const handleCurrencyChange = (index: number, newCurrency: string, currentPrice: number) => {
    const newDatesPrices = [...datesPrices];
    const oldCurrency = newDatesPrices[index].currency;
    
    // Eski para birimindeki değeri sıfırla
    if (oldCurrency === 'USD') newDatesPrices[index].price_usd = 0;
    if (oldCurrency === 'EUR') newDatesPrices[index].price_eur = 0;
    if (oldCurrency === 'TRY') newDatesPrices[index].price_try = 0;

    // Yeni para birimini ayarla
    newDatesPrices[index].currency = newCurrency;
    
    // Yeni para birimi için fiyatı ayarla
    if (newCurrency === 'USD') newDatesPrices[index].price_usd = currentPrice;
    if (newCurrency === 'EUR') newDatesPrices[index].price_eur = currentPrice;
    if (newCurrency === 'TRY') newDatesPrices[index].price_try = currentPrice;

    setDatesPrices(newDatesPrices);
  };

  // Form gönderme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form verilerini kontrol et
      if (!formData.title || !formData.region || !formData.duration) {
        throw new Error('Lütfen tüm zorunlu alanları doldurun');
      }

      let tourId = tour?.id;
      let tourData = {
        ...formData,
        base_price: Number(formData.base_price) || 0,
        updated_at: new Date().toISOString()
      };

      // Tur güncelleme veya oluşturma
      if (isEditMode && tourId) {
        // Mevcut turu güncelle
        const { data: updatedTour, error: updateError } = await supabase
          .from('tours')
          .update(tourData)
          .eq('id', tourId)
          .select()
          .single();

        if (updateError) throw updateError;
        if (!updatedTour) throw new Error('Tour update failed');
        
        tourId = updatedTour.id;
      } else {
        // Yeni tur oluştur
        const { data: newTour, error: createError } = await supabase
          .from('tours')
          .insert({
            ...tourData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        if (!newTour) throw new Error('Tour creation failed');
        
        tourId = newTour.id;
      }

      // Tarih ve fiyatları kaydet
      if (isEditMode) {
        await supabase
          .from('tour_dates_prices')
          .delete()
          .eq('tour_id', tourId);
      }
      
      if (datesPrices.length > 0) {
        // Fiyat verilerini güvenli hale getirme
        const processedPrices = datesPrices.map(datePrice => ({
          tour_id: tourId,
          travel_period: datePrice.travel_period || '',
          price_category: datePrice.price_category || 'Standart',
          airline: datePrice.airline || '',
          price: Number(datePrice.price) || 0,
          currency: datePrice.currency || 'USD',
          price_usd: Number(datePrice.price_usd) || 0,
          price_eur: Number(datePrice.price_eur) || 0,
          price_try: Number(datePrice.price_try) || 0,
          created_at: new Date().toISOString()
        }));

        const { error: pricesError } = await supabase
          .from('tour_dates_prices')
          .insert(processedPrices);

        if (pricesError) throw pricesError;
      }

      // Başarılı sonuç
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving tour:', error);
      alert(`Tur kaydedilirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yeni gün programı ekleme fonksiyonu
  const handleAddDailyProgram = () => {
    setDailyPrograms([
      ...dailyPrograms,
      {
        day_range: `${dailyPrograms.length + 1}`,
        title: '',
        description: ''
      }
    ]);
  };

  // Gün programı güncelleme fonksiyonu
  const handleDailyProgramChange = (index: number, field: keyof DailyProgram, value: string) => {
    setDailyPrograms(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {isEditMode ? 'Tur Düzenle' : 'Yeni Tur Ekle'}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-4">
                  {[
                    { id: 'general', name: 'Genel Bilgiler', icon: Info },
                    { id: 'images', name: 'Görseller', icon: Image },
                    { id: 'highlights', name: 'Öne Çıkanlar', icon: MapPin },
                    { id: 'program', name: 'Program', icon: Calendar },
                    { id: 'pricing', name: 'Fiyatlandırma', icon: DollarSign },
                    { id: 'weather', name: 'Hava Durumu', icon: Sun },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                        ${activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <tab.icon className={`
                        -ml-0.5 mr-2 h-5 w-5
                        ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `} />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab içerikleri */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Tur Başlığı
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        name="slug"
                        id="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        URL'de kullanılacak benzersiz tanımlayıcı
                      </p>
                    </div>

                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                        Bölge
                      </label>
                      <input
                        type="text"
                        name="region"
                        id="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                        Süre
                      </label>
                      <input
                        type="text"
                        name="duration"
                        id="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="Örn: 5 GÜN"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">
                        Başlangıç Fiyatı
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">
                            {formData.base_price_currency === 'USD' ? '$' : 
                             formData.base_price_currency === 'EUR' ? '€' : '₺'}
                          </span>
                        </div>
                        <input
                          type="number"
                          name="base_price"
                          id="base_price"
                          value={formData.base_price}
                          onChange={handleInputChange}
                          className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <select
                            name="base_price_currency"
                            value={formData.base_price_currency}
                            onChange={handleInputChange}
                            className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="TRY">TRY</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tour_type_id" className="block text-sm font-medium text-gray-700">
                        Tur Tipi
                      </label>
                      <select
                        value={formData.tour_type_id || ''}
                        onChange={(e) => setFormData({ ...formData, tour_type_id: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      >
                        <option value="">Tur tipi seçin</option>
                        {tourTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.header_title} ({type.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
                      Kısa Açıklama
                    </label>
                    <textarea
                      name="short_description"
                      id="short_description"
                      rows={2}
                      value={formData.short_description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Tur listesinde görünecek kısa açıklama
                    </p>
                  </div>

                  <div>
                    <label htmlFor="long_description" className="block text-sm font-medium text-gray-700">
                      Detaylı Açıklama
                    </label>
                    <textarea
                      name="long_description"
                      id="long_description"
                      rows={4}
                      value={formData.long_description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Görseller Tab'i */}
              {activeTab === 'images' && (
                <div className="space-y-8">
                  {/* Hero Görsel */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Görsel</h3>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-40 h-40 border rounded-lg overflow-hidden bg-gray-100">
                        {formData.hero_image_path ? (
                          <div className="relative w-full h-full">
                            <img
                              src={getImageUrl(formData.hero_image_path)}
                              alt="Hero görsel"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageDelete('', 'hero')}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="hero-image"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Selected file:', file.name);
                              handleImageUpload(file, 'hero');
                            }
                          }}
                        />
                        <label
                          htmlFor="hero-image"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Hero Görsel Seç
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Harita Görsel */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Harita Görseli</h3>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-40 h-40 border rounded-lg overflow-hidden bg-gray-100">
                        {images.find(img => img.image_type === 'map')?.storage_path ? (
                          <div className="relative w-full h-full">
                            <img
                              src={getImageUrl(images.find(img => img.image_type === 'map')?.storage_path || '')}
                              alt="Harita"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageDelete(images.find(img => img.image_type === 'map')?.id || '', 'map')}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="map-image"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'map');
                          }}
                        />
                        <label
                          htmlFor="map-image"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Harita Görseli Seç
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Galeri Görselleri */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Galeri Görselleri</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {images.filter(img => img.image_type === 'gallery').map((image, index) => (
                        <div key={image.id || index} className="relative">
                          <img
                            src={getImageUrl(image.storage_path || '')}
                            alt={image.alt_text || ''}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageDelete(image.id || '', 'gallery')}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Yeni galeri görseli ekleme butonu */}
                      <div>
                        <input
                          type="file"
                          id="gallery-image"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Selected file:', file.name);
                              handleImageUpload(file, 'gallery');
                            }
                          }}
                        />
                        <label
                          htmlFor="gallery-image"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer"
                        >
                          <Plus className="w-8 h-8 text-gray-400" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Öne Çıkanlar Tab'i */}
              {activeTab === 'highlights' && (
                <div className="space-y-8">
                  {/* Önemli Noktalar */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Önemli Noktalar</h3>
                      <button
                        type="button"
                        onClick={() => setHighlights([...highlights, { content: '', display_order: highlights.length + 1 }])}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Yeni Ekle
                      </button>
                    </div>

                    <div className="space-y-4">
                      {highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newHighlights = [...highlights];
                                  newHighlights.splice(index, 1);
                                  // Sıralamayı güncelle
                                  newHighlights.forEach((h, i) => {
                                    h.display_order = i + 1;
                                  });
                                  setHighlights(newHighlights);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <textarea
                              value={highlight.content}
                              onChange={(e) => {
                                const newHighlights = [...highlights];
                                newHighlights[index].content = e.target.value;
                                setHighlights(newHighlights);
                              }}
                              rows={2}
                              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Öne çıkan özelliği buraya yazın..."
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (index > 0) {
                                  const newHighlights = [...highlights];
                                  const temp = newHighlights[index];
                                  newHighlights[index] = newHighlights[index - 1];
                                  newHighlights[index - 1] = temp;
                                  // Sıralamayı güncelle
                                  newHighlights.forEach((h, i) => {
                                    h.display_order = i + 1;
                                  });
                                  setHighlights(newHighlights);
                                }
                              }}
                              disabled={index === 0}
                              className={`p-1 rounded ${index === 0 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (index < highlights.length - 1) {
                                  const newHighlights = [...highlights];
                                  const temp = newHighlights[index];
                                  newHighlights[index] = newHighlights[index + 1];
                                  newHighlights[index + 1] = temp;
                                  // Sıralamayı güncelle
                                  newHighlights.forEach((h, i) => {
                                    h.display_order = i + 1;
                                  });
                                  setHighlights(newHighlights);
                                }
                              }}
                              disabled={index === highlights.length - 1}
                              className={`p-1 rounded ${index === highlights.length - 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dahil Olanlar */}
                  <div className="space-y-6 pt-6 border-t">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Dahil Olanlar</h3>
                      <button
                        type="button"
                        onClick={() => setInclusions([...inclusions, { content: '', display_order: inclusions.length + 1 }])}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Yeni Ekle
                      </button>
                    </div>

                    <div className="space-y-4">
                      {inclusions.map((inclusion, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newInclusions = [...inclusions];
                                  newInclusions.splice(index, 1);
                                  newInclusions.forEach((inc, i) => {
                                    inc.display_order = i + 1;
                                  });
                                  setInclusions(newInclusions);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <textarea
                              value={inclusion.content}
                              onChange={(e) => {
                                const newInclusions = [...inclusions];
                                newInclusions[index].content = e.target.value;
                                setInclusions(newInclusions);
                              }}
                              rows={2}
                              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Dahil olan hizmeti buraya yazın..."
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (index > 0) {
                                  const newInclusions = [...inclusions];
                                  const temp = newInclusions[index];
                                  newInclusions[index] = newInclusions[index - 1];
                                  newInclusions[index - 1] = temp;
                                  newInclusions.forEach((inc, i) => {
                                    inc.display_order = i + 1;
                                  });
                                  setInclusions(newInclusions);
                                }
                              }}
                              disabled={index === 0}
                              className={`p-1 rounded ${index === 0 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (index < inclusions.length - 1) {
                                  const newInclusions = [...inclusions];
                                  const temp = newInclusions[index];
                                  newInclusions[index] = newInclusions[index + 1];
                                  newInclusions[index + 1] = temp;
                                  newInclusions.forEach((inc, i) => {
                                    inc.display_order = i + 1;
                                  });
                                  setInclusions(newInclusions);
                                }
                              }}
                              disabled={index === inclusions.length - 1}
                              className={`p-1 rounded ${index === inclusions.length - 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* İpuçları */}
                  <div className="space-y-6 pt-6 border-t">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">İpuçları</h3>
                      <button
                        type="button"
                        onClick={() => setTips([...tips, { content: '', icon_name: 'map-pin' }])}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Yeni Ekle
                      </button>
                    </div>

                    <div className="space-y-4">
                      {tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <select
                                value={tip.icon_name}
                                onChange={(e) => {
                                  const newTips = [...tips];
                                  newTips[index].icon_name = e.target.value;
                                  setTips(newTips);
                                }}
                                className="border border-gray-300 rounded-md shadow-sm text-sm"
                              >
                                <option value="map-pin">Konum</option>
                                <option value="clock">Saat</option>
                                <option value="sun">Hava</option>
                                <option value="umbrella">Şemsiye</option>
                                <option value="camera">Kamera</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  const newTips = [...tips];
                                  newTips.splice(index, 1);
                                  setTips(newTips);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <textarea
                              value={tip.content}
                              onChange={(e) => {
                                const newTips = [...tips];
                                newTips[index].content = e.target.value;
                                setTips(newTips);
                              }}
                              rows={2}
                              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="İpucunu buraya yazın..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Program Tab'i */}
              {activeTab === 'program' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Günlük Program</h3>
                    <button
                      type="button"
                      onClick={handleAddDailyProgram}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Yeni Gün Ekle
                    </button>
                  </div>

                  <div className="space-y-6">
                    {dailyPrograms.map((program, index) => (
                      <div key={index} className="bg-white shadow rounded-lg p-6">
                        <div className="grid grid-cols-1 gap-6">
                          {/* Gün Başlığı */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {program.day_range}. Gün Başlığı
                            </label>
                            <input
                              type="text"
                              value={program.title}
                              onChange={(e) => handleDailyProgramChange(index, 'title', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Gün başlığını girin"
                            />
                          </div>

                          {/* Gün Açıklaması */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Program Detayı
                            </label>
                            <textarea
                              value={program.description}
                              onChange={(e) => handleDailyProgramChange(index, 'description', e.target.value)}
                              rows={4}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Günün program detaylarını girin"
                            />
                          </div>

                          {/* Silme Butonu */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setDailyPrograms(prev => {
                                  const updated = prev.filter((_, i) => i !== index);
                                  // Günleri yeniden numaralandır
                                  return updated.map((p, i) => ({
                                    ...p,
                                    day_range: (i + 1).toString(),
                                    title: p.title.replace(/^\d+/, (i + 1).toString())
                                  }));
                                });
                              }}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Günü Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fiyatlandırma Tab'i */}
              {activeTab === 'pricing' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Tarihler ve Fiyatlar</h3>
                    <button
                      type="button"
                      onClick={() => setDatesPrices([...datesPrices, { 
                        travel_period: '', 
                        price_category: 'Standart', 
                        airline: '',
                        price: 0,
                        currency: 'USD'
                      }])}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Yeni Dönem Ekle
                    </button>
                  </div>

                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                            Seyahat Dönemi
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Fiyat Kategorisi
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Havayolu
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Para Birimi
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Fiyat
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4">
                            <span className="sr-only">İşlemler</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {datesPrices.map((datePrice, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3">
                              <input
                                type="text"
                                value={datePrice.travel_period}
                                onChange={(e) => {
                                  const newDatesPrices = [...datesPrices];
                                  newDatesPrices[index].travel_period = e.target.value;
                                  setDatesPrices(newDatesPrices);
                                }}
                                className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                                placeholder="Örn: 1-23 Mart"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <select
                                value={datePrice.price_category}
                                onChange={(e) => {
                                  const newDatesPrices = [...datesPrices];
                                  newDatesPrices[index].price_category = e.target.value;
                                  setDatesPrices(newDatesPrices);
                                }}
                                className="block w-full border-0 p-0 text-gray-900 focus:ring-0 sm:text-sm"
                              >
                                <option value="Bütçe">Bütçe</option>
                                <option value="Standart">Standart</option>
                                <option value="Üst">Üst</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <input
                                type="text"
                                value={datePrice.airline}
                                onChange={(e) => {
                                  const newDatesPrices = [...datesPrices];
                                  newDatesPrices[index].airline = e.target.value;
                                  setDatesPrices(newDatesPrices);
                                }}
                                className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                                placeholder="Örn: Etihad Havayolları (EY)"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <select
                                value={datePrice.currency}
                                onChange={(e) => {
                                  const newDatesPrices = [...datesPrices];
                                  newDatesPrices[index].currency = e.target.value;
                                  setDatesPrices(newDatesPrices);
                                }}
                                className="block w-full border-0 p-0 text-gray-900 focus:ring-0 sm:text-sm"
                              >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="TRY">TRY</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <input
                                type="number"
                                value={datePrice.price}
                                onChange={(e) => {
                                  const newDatesPrices = [...datesPrices];
                                  newDatesPrices[index].price = Number(e.target.value);
                                  setDatesPrices(newDatesPrices);
                                }}
                                className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const newDatesPrices = [...datesPrices];
                                  newDatesPrices.splice(index, 1);
                                  setDatesPrices(newDatesPrices);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hava Durumu Tab'i */}
              {activeTab === 'weather' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Aylık Hava Durumu</h3>
                  </div>

                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                            Ay
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Sıcaklık (°C)
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Yağış (mm)
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                            En İyi Dönem
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {MONTHS.map((month, index) => {
                          const monthData = weatherData.find(w => w.month === month) || {
                            month,
                            temperature: 0,
                            rainfall: 0,
                            is_best_period: false
                          };

                          return (
                            <tr key={month}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                {month}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4">
                                <input
                                  type="number"
                                  value={monthData.temperature}
                                  onChange={(e) => {
                                    const newWeatherData = [...weatherData];
                                    const monthIndex = newWeatherData.findIndex(w => w.month === month);
                                    if (monthIndex >= 0) {
                                      newWeatherData[monthIndex].temperature = Number(e.target.value);
                                    } else {
                                      newWeatherData.push({
                                        month: month,
                                        temperature: Number(e.target.value),
                                        rainfall: 0,
                                        is_best_period: false
                                      });
                                    }
                                    setWeatherData(newWeatherData);
                                  }}
                                  className="block w-24 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  placeholder="0"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-4">
                                <input
                                  type="number"
                                  value={monthData.rainfall}
                                  onChange={(e) => {
                                    const newWeatherData = [...weatherData];
                                    const monthIndex = newWeatherData.findIndex(w => w.month === month);
                                    if (monthIndex >= 0) {
                                      newWeatherData[monthIndex].rainfall = Number(e.target.value);
                                    } else {
                                      newWeatherData.push({
                                        month: month,
                                        temperature: 0,
                                        rainfall: Number(e.target.value),
                                        is_best_period: false
                                      });
                                    }
                                    setWeatherData(newWeatherData);
                                  }}
                                  className="block w-24 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  placeholder="0"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={monthData.is_best_period}
                                  onChange={(e) => {
                                    const newWeatherData = [...weatherData];
                                    const monthIndex = newWeatherData.findIndex(w => w.month === month);
                                    if (monthIndex >= 0) {
                                      newWeatherData[monthIndex].is_best_period = e.target.checked;
                                    } else {
                                      newWeatherData.push({
                                        month: month,
                                        temperature: 0,
                                        rainfall: 0,
                                        is_best_period: e.target.checked
                                      });
                                    }
                                    setWeatherData(newWeatherData);
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Görsel Önizleme */}
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Grafik Önizleme</h4>
                    <div className="grid grid-cols-12 gap-2 bg-gray-50 p-4 rounded-lg">
                      {weatherData.map((month, index) => (
                        <div key={index} className="flex flex-col justify-end h-40 relative">
                          {/* Sıcaklık Çubuğu */}
                          <div
                            className="w-full bg-[#FFA500] absolute bottom-0 rounded-t-lg"
                            style={{ height: `${(month.temperature / 40) * 100}%` }}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs">
                              {month.temperature}°C
                            </span>
                          </div>
                          
                          {/* Yağış Göstergesi */}
                          <div
                            className="w-full bg-blue-200 absolute bottom-0 rounded-t-lg opacity-50"
                            style={{ height: `${(month.rainfall / 8) * 100}%` }}
                          />
                          
                          {/* Ay İsmi */}
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs">
                            {month.month}
                          </span>
                          
                          {/* En İyi Dönem İşareti */}
                          {month.is_best_period && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                              <span className="text-yellow-500">★</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isSubmitting ? 'Kaydediliyor...' : isEditMode ? 'Güncelle' : 'Kaydet'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTourForm;