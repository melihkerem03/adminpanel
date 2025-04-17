import React, { useState, useEffect } from 'react';
import { Map, Plus, Edit, Trash2, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tour {
  id: string;
  title: string;
  region: string;
  slug: string;
  destination_status: boolean;
}

interface RegionImage {
  region: string;
  image_path: string;
}

interface Destination {
  region: string;
  tours: Tour[];
  isExpanded?: boolean;
  image_path?: string;
}

const DestinationManagement = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTours, setSelectedTours] = useState<string[]>([]);
  const [regionImages, setRegionImages] = useState<RegionImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Turları yükle
  useEffect(() => {
    loadTours();
  }, []);

  // Bölge görsellerini yükle
  useEffect(() => {
    loadRegionImages();
  }, []);

  // Turları yükle ve destinasyonları grupla
  const loadTours = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('id, title, region, slug, destination_status')
        .order('region', { ascending: true });

      if (error) throw error;

      if (!data) {
        setDestinations([]);
        setTours([]);
        return;
      }

      // Turları bölgelere göre grupla
      const groupedTours = data.reduce((acc: Destination[], tour: Tour) => {
        const existingRegion = acc.find(d => d.region === tour.region);
        if (existingRegion) {
          existingRegion.tours.push(tour);
        } else {
          acc.push({ 
            region: tour.region, 
            tours: [tour], 
            isExpanded: true // varsayılan olarak açık
          });
        }
        return acc;
      }, []);

      setDestinations(groupedTours);
      setTours(data);
    } catch (error) {
      console.error('Error loading tours:', error);
      alert('Turlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegionImages = async () => {
    try {
      const { data, error } = await supabase
        .from('region_images')
        .select('region, image_path');

      if (error) throw error;
      setRegionImages(data || []);
    } catch (error) {
      console.error('Error loading region images:', error);
    }
  };

  // Destinasyon durumunu güncelle
  const handleDestinationStatusChange = async (tourId: string, status: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('tours')
        .update({ destination_status: status })
        .eq('id', tourId);

      if (error) throw error;

      // Listeyi güncelle
      await loadTours();
    } catch (error) {
      console.error('Error updating destination status:', error);
      alert('Durum güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Bölgeyi genişlet/daralt
  const toggleRegion = (region: string) => {
    setDestinations(prev => prev.map(d => 
      d.region === region ? { ...d, isExpanded: !d.isExpanded } : d
    ));
  };

  // Görsel yükleme fonksiyonu
  const handleImageUpload = async (file: File, region: string) => {
    try {
      setIsUploadingImage(true);

      // Dosya adını temizle ve güvenli hale getir
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name
        .split('.')[0]
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-');

      const fileName = `${sanitizedName}-${Date.now()}.${fileExt}`;
      const filePath = `region-images/${fileName}`;

      // Görseli storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Veritabanına kaydet
      const { error: dbError } = await supabase
        .from('region_images')
        .upsert({
          region: region,
          image_path: filePath,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'region'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // Region images'ı güncelle
      await loadRegionImages();

      console.log('Upload successful:', {
        fileName,
        filePath,
        region
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Görsel yüklenirken bir hata oluştu');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Görsel URL'i al
  const getImageUrl = (path: string) => {
    return supabase.storage
      .from('site-images')
      .getPublicUrl(path)
      .data.publicUrl;
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Map className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold">Destinasyonlar</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {destinations.map((destination) => (
                <div key={destination.region} className="border rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                    onClick={() => toggleRegion(destination.region)}
                  >
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-lg">{destination.region}</h3>
                      {/* Görsel yükleme alanı */}
                      <div className="relative">
                        <input
                          type="file"
                          id={`image-${destination.region}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, destination.region);
                          }}
                        />
                        <label
                          htmlFor={`image-${destination.region}`}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer"
                        >
                          <Image className="w-4 h-4 mr-1" />
                          {regionImages.find(img => img.region === destination.region)
                            ? 'Görseli Değiştir'
                            : 'Görsel Ekle'
                          }
                        </label>
                      </div>
                    </div>
                    {destination.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Bölge görseli önizleme */}
                  {destination.isExpanded && (
                    <div className="p-4">
                      {regionImages.find(img => img.region === destination.region) && (
                        <div className="mb-4 relative">
                          <img
                            src={getImageUrl(regionImages.find(img => img.region === destination.region)!.image_path)}
                            alt={destination.region}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="p-4 space-y-3">
                        {destination.tours.map((tour) => (
                          <div 
                            key={tour.id}
                            className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded"
                          >
                            <div>
                              <h4 className="font-medium">{tour.title}</h4>
                              <a 
                                href={`/tours/${tour.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                Turu Görüntüle
                              </a>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDestinationStatusChange(tour.id, !tour.destination_status)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  tour.destination_status
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {tour.destination_status ? 'Aktif' : 'Pasif'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationManagement;