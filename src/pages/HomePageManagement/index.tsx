import React, { useState, useEffect, useRef } from 'react';
import { Save, Image, Layout, Type, Layers, Map, BarChart2, Briefcase, Plus, Trash2, Info, Edit, X, Calendar, Users, Star, Heart, Shield, Phone, Mail, Clock, Globe, Award, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaStar, 
  FaHeart,
  FaShieldAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaGlobe,
  FaAward
} from 'react-icons/fa';

// Tip tanımlamaları
interface HeroSettings {
  id?: string;
  title: string;
  subtitle: string;
  image_path: string | null;  // null olabilir
  created_at?: string;
  updated_at?: string;
}

interface Tour {
  id: string;
  title: string;
  region: string;
  short_description: string;
  hero_image_path: string;
  popular_tour: boolean;
}

interface FeaturedSectionSettings {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

// Interface tanımlaması ekle
interface Service {
  id?: string;
  name: string;
  short_description: string;
  long_description: string;
  icon_svg: string;
  image_path?: string;
  display_order: number;
  is_active: boolean;
}

// İkon map objesi oluştur
const IconComponents = {
  Map: FaMapMarkerAlt,
  Calendar: FaCalendarAlt,
  Users: FaUsers,
  Star: FaStar,
  Heart: FaHeart,
  Shield: FaShieldAlt,
  Phone: FaPhone,
  Mail: FaEnvelope,
  Clock: FaClock,
  Globe: FaGlobe,
  Award: FaAward
} as const;

// Interface tanımlaması ekle
interface Partner {
  id?: string;
  name: string;
  logo_path: string;
  website_url?: string;
  display_order: number;
  is_active: boolean;
}

// Stats interface'i ekle
interface Stat {
  id?: string;
  title: string;
  subtitle_first: string;
  subtitle_second: string;
  stat_value: number;
  stat_label: string;
  stat_description: string;
  stat_icon_svg: string;
  display_order: number;
  is_active: boolean;
}

// Interface tanımlamasını ekleyin (dosyanın üst kısmına)
interface LogoSettings {
  id?: string;
  logo_path: string | null;
  created_at?: string;
  updated_at?: string;
}

// Interface tanımlamalarına ekleyin
interface MapSettings {
  id?: string;
  map_image_path: string | null;
  title: string;
  subtitle: string;
  created_at?: string;
  updated_at?: string;
}

// Interface tanımlamalarına ekleyin
interface MapLocation {
  id?: string;
  map_id: string;
  name: string;
  description: string;
  x_position: number;
  y_position: number;
  is_active: boolean;
}

const HomePageManagement = () => {
  // activeTab state'ini güncelle
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'tours' | 'information' | 'map' | 'stats' | 'partners'>('logo');
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: '',
    subtitle: '',
    image_path: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTours, setSelectedTours] = useState<Tour[]>([]);
  const [isToursLoading, setIsToursLoading] = useState(false);
  const [featuredSettings, setFeaturedSettings] = useState<FeaturedSectionSettings>({
    title: '',
    subtitle: '',
    description: '',
    is_active: true,
    display_order: 1
  });

  // Yeni state'ler ekle
  const [services, setServices] = useState<Service[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState<Service>({
    name: '',
    short_description: '',
    long_description: '',
    icon_svg: '',
    display_order: 1,
    is_active: true
  });

  // Düzenleme modu için state ekle
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Partner state'lerini ekle
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isPartnersLoading, setIsPartnersLoading] = useState(false);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [isEditingPartner, setIsEditingPartner] = useState<Partner | null>(null);
  const [newPartner, setNewPartner] = useState<Partner>({
    name: '',
    logo_path: '',
    website_url: '',
    display_order: 1,
    is_active: true
  });

  // Stats state'lerini ekle
  const [stats, setStats] = useState<Stat[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [isEditingStat, setIsEditingStat] = useState<Stat | null>(null);
  const [newStat, setNewStat] = useState<Stat>({
    title: 'RAKAMLARLA BİZ',
    subtitle_first: 'Seyahatin',
    subtitle_second: 'Geleceğini Şekillendiriyoruz',
    stat_value: 0,
    stat_label: '',
    stat_description: '',
    stat_icon_svg: '',
    display_order: 1,
    is_active: true
  });

  // State tanımlamaları
  const [mapImage, setMapImage] = useState('');
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<MapLocation>>({
    name: '',
    description: '',
    x_position: 50,
    y_position: 50,
    is_active: true
  });
  const mapRef = useRef<HTMLImageElement>(null);
  const mapImageRef = useRef<HTMLImageElement>(null);

  // Logo state'lerini ekle
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    logo_path: null
  });

  // Harita ayarlarını yüklemek için state ekle
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    map_image_path: null,
    title: '',
    subtitle: ''
  });

  // Hero ayarlarını yükle
  useEffect(() => {
    loadHeroSettings();
  }, []);

  // Turları yükle
  useEffect(() => {
    loadTours();
  }, []);

  // Featured section ayarlarını yükle
  useEffect(() => {
    loadFeaturedSettings();
  }, []);

  // Servisleri yükle
  useEffect(() => {
    loadServices();
  }, []);

  // Partner verilerini yükle
  useEffect(() => {
    loadPartners();
  }, []);

  // Stats verilerini yükle
  useEffect(() => {
    loadStats();
  }, []);

  // Logo ayarlarını yüklemek için fonksiyon
  useEffect(() => {
    loadLogoSettings();
  }, []);

  // Harita ayarlarını yüklemek için fonksiyon
  useEffect(() => {
    loadMapSettings();
  }, []);

  // Konum yükleme fonksiyonu
  const loadLocations = async () => {
    try {
      if (!mapSettings.id) return;

      const { data, error } = await supabase
        .from('map_locations')
        .select('*')
        .eq('map_id', mapSettings.id)
        .order('created_at');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  // Harita ayarları yüklendiğinde konumları da yükle
  useEffect(() => {
    if (mapSettings.id) {
      loadLocations();
    }
  }, [mapSettings.id]);

  // Konum ekleme fonksiyonu
  const handleAddLocation = async () => {
    try {
      if (!mapSettings.id) {
        throw new Error('Önce harita görselini kaydedin');
      }

      setIsLoading(true);

      const { error } = await supabase
        .from('map_locations')
        .insert([{
          ...newLocation,
          map_id: mapSettings.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      await loadLocations();
      setIsAddingLocation(false);
      setNewLocation({
        name: '',
        description: '',
        x_position: 50,
        y_position: 50,
        is_active: true
      });

      alert('Konum başarıyla eklendi!');
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Konum eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Konum silme fonksiyonu
  const handleDeleteLocation = async (locationId: string) => {
    try {
      if (!window.confirm('Bu konumu silmek istediğinizden emin misiniz?')) return;

      setIsLoading(true);

      const { error } = await supabase
        .from('map_locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;

      await loadLocations();
      alert('Konum başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Konum silinirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHeroSettings = async () => {
    try {
      setIsInitialLoading(true);
      
      // En son eklenen hero ayarlarını getir
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .order('created_at', { ascending: false }) // En son eklenen ilk sırada
        .limit(1)  // Sadece en son kaydı al
        .single(); // Tek kayıt olarak döndür

      if (error) {
        if (error.code === 'PGRST116') { // Veri bulunamadı hatası
          // İlk kayıt oluştur
          const initialSettings = {
            title: 'Hoş Geldiniz',
            subtitle: 'Sizin için en iyi turları sunuyoruz',
            image_path: null
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('hero_settings')
            .insert([initialSettings])
            .select()
            .single();
            
          if (insertError) throw insertError;
          setHeroSettings(newData);
        } else {
          throw error;
        }
      } else if (data) {
        setHeroSettings(data);
      }
    } catch (error) {
      console.error('Error loading hero settings:', error);
      alert('Hero ayarları yüklenirken bir hata oluştu');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadTours = async () => {
    try {
      setIsToursLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('id, title, region, short_description, hero_image_path, popular_tour')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTours(data || []);
      setSelectedTours(data?.filter(tour => tour.popular_tour) || []);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setIsToursLoading(false);
    }
  };

  const loadFeaturedSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('featured_section_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (data) setFeaturedSettings(data);
    } catch (error) {
      console.error('Error loading featured settings:', error);
    }
  };

  const loadServices = async () => {
    try {
      setIsServicesLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsServicesLoading(false);
    }
  };

  // Partner verilerini yükle
  const loadPartners = async () => {
    try {
      setIsPartnersLoading(true);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setIsPartnersLoading(false);
    }
  };

  // Stats verilerini yükle
  const loadStats = async () => {
    try {
      setIsStatsLoading(true);
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Logo ayarlarını yüklemek için fonksiyon
  const loadLogoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('logo_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Veri bulunamadı hatası
          const initialSettings = {
            logo_path: null
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('logo_settings')
            .insert([initialSettings])
            .select()
            .single();
            
          if (insertError) throw insertError;
          setLogoSettings(newData);
        } else {
          throw error;
        }
      } else if (data) {
        setLogoSettings(data);
      }
    } catch (error) {
      console.error('Error loading logo settings:', error);
    }
  };

  // Harita ayarlarını yüklemek için fonksiyon
  const loadMapSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('map_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Veri bulunamadı hatası
          const initialSettings = {
            map_image_path: null,
            title: 'Türkiye Haritası',
            subtitle: 'Keşfedilecek Rotalar'
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('map_settings')
            .insert([initialSettings])
            .select()
            .single();
            
          if (insertError) throw insertError;
          setMapSettings(newData);
        } else {
          throw error;
        }
      } else if (data) {
        setMapSettings(data);
      }
    } catch (error) {
      console.error('Error loading map settings:', error);
    }
  };

  // Otomatik kaydetme için debounce fonksiyonu
  const autoSave = async (settings: HeroSettings) => {
    try {
      // Boş değerleri kontrol et
      if (!settings.title || !settings.subtitle) {
        return; // Zorunlu alanlar boşsa kaydetme
      }

      const { error } = await supabase
        .from('hero_settings')
        .insert([{
          title: settings.title,
          subtitle: settings.subtitle,
          image_path: settings.image_path || null,
          created_at: new Date(),
          updated_at: new Date()
        }]);

      if (error) throw error;

      // Eski kayıtları temizle
      await cleanupOldRecords();
      
      // Verileri yeniden yükle
      await loadHeroSettings();
    } catch (error) {
      console.error('Error auto-saving:', error);
    }
  };

  // Input değişikliklerini handle et - realtime kaydetme kaldırıldı
  const handleInputChange = (field: keyof HeroSettings, value: string) => {
    setHeroSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Görsel yükleme fonksiyonu
  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Dosya kontrolü
      if (!file) {
        throw new Error('Lütfen bir görsel seçin');
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        throw new Error('Lütfen geçerli bir görsel dosyası seçin');
      }

      // Dosya boyutu kontrolü (örn: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Görsel boyutu 5MB\'dan küçük olmalıdır');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      // Eski görseli sil
      if (heroSettings.image_path) {
        const { error: deleteError } = await supabase.storage
          .from('site-images')
          .remove([heroSettings.image_path]);

        if (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      // Yeni görseli yükle
      const { error: uploadError, data } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // State'i güncelle ve otomatik kaydet
      const newSettings = {
        ...heroSettings,
        image_path: filePath
      };
      setHeroSettings(newSettings);
      await autoSave(newSettings);

      // Başarılı mesajı göster
      alert('Görsel başarıyla yüklendi!');

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Görsel yüklenirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Eski kayıtları temizle
  const cleanupOldRecords = async () => {
    try {
      // En son kaydı hariç tüm kayıtları sil
      const { error } = await supabase
        .from('hero_settings')
        .delete()
        .lt('created_at', heroSettings.created_at);

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up old records:', error);
    }
  };

  // getImageUrl fonksiyonunu güncelleyin
  const getImageUrl = (path: string | null): string => {
    if (!path) return '';
    try {
      const { data } = supabase.storage
        .from('site-images')
        .getPublicUrl(path);

      // URL'i kontrol etmek için log ekleyelim
      console.log('Image path:', path);
      console.log('Generated URL:', data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return '';
    }
  };

  const handleSaveChanges = async () => {
    if (!heroSettings.title || !heroSettings.subtitle) {
      alert('Başlık ve alt başlık alanları zorunludur');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('hero_settings')
        .insert([{
          title: heroSettings.title,
          subtitle: heroSettings.subtitle,
          image_path: heroSettings.image_path || null,
          created_at: new Date(),
          updated_at: new Date()
        }]);

      if (error) throw error;
      
      await cleanupOldRecords();
      await loadHeroSettings();
      
      alert('Değişiklikler başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Değişiklikler kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Popüler tur seçimini güncelle
  const handleTourSelection = async (tour: Tour) => {
    try {
      if (selectedTours.length >= 6 && !tour.popular_tour) {
        alert('En fazla 6 adet popüler tur seçebilirsiniz!');
        return;
      }

      const isSelected = tour.popular_tour;
      const { error } = await supabase
        .from('tours')
        .update({ popular_tour: !isSelected })
        .eq('id', tour.id);

      if (error) throw error;

      // State'i güncelle
      await loadTours();
    } catch (error) {
      console.error('Error updating tour:', error);
      alert('Tur güncellenirken bir hata oluştu');
    }
  };

  const handleFeaturedSettingsSave = async () => {
    try {
      setIsLoading(true);

      // Önce tüm kayıtları pasif yap
      const { error: updateError } = await supabase
        .from('featured_section_settings')
        .update({ is_active: false })
        .not('id', 'eq', featuredSettings.id); // Mevcut kaydı hariç tut

      if (updateError) throw updateError;

      // Mevcut kaydı güncelle veya yeni kayıt oluştur
      const { error } = await supabase
        .from('featured_section_settings')
        .upsert({
          id: featuredSettings.id, // Eğer id varsa günceller, yoksa yeni kayıt oluşturur
          title: featuredSettings.title,
          subtitle: featuredSettings.subtitle,
          description: featuredSettings.description,
          is_active: true,
          display_order: featuredSettings.display_order,
          updated_at: new Date()
        });

      if (error) throw error;

      alert('Ayarlar başarıyla kaydedildi!');
      await loadFeaturedSettings();
    } catch (error) {
      console.error('Error saving featured settings:', error);
      alert('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Düzenleme modunu aç
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsEditMode(true);
    setIsAddingService(true); // Mevcut formu kullanacağız
    setNewService({ ...service }); // Mevcut servisi form verilerine kopyala
  };

  // Servisi güncelle
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('services')
        .update({
          name: newService.name,
          short_description: newService.short_description,
          long_description: newService.long_description,
          icon_svg: newService.icon_svg,
          image_path: newService.image_path,
          updated_at: new Date()
        })
        .eq('id', editingService?.id);

      if (error) throw error;

      // Başarılı mesajı göster
      alert('Bilgilendirme başarıyla güncellendi!');
      
      // Listeyi yenile
      await loadServices();
      
      // Formu kapat
      handleCloseForm();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Bilgilendirme güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Formu kapat
  const handleCloseForm = () => {
    setIsAddingService(false);
    setIsEditMode(false);
    setEditingService(null);
    setNewService({
      name: '',
      short_description: '',
      long_description: '',
      icon_svg: '',
      display_order: services.length + 1,
      is_active: true
    });
  };

  // Form submit handler'ını güncelle
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      await handleUpdateService(e);
    } else {
      // Mevcut ekleme işlemi
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('services')
          .insert([{
            ...newService,
            created_at: new Date(),
            updated_at: new Date()
          }]);

        if (error) throw error;

        alert('Bilgilendirme başarıyla eklendi!');
        await loadServices();
        handleCloseForm();
      } catch (error) {
        console.error('Error adding service:', error);
        alert('Bilgilendirme eklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleServiceStatusChange = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      await loadServices();
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  // Görsel yükleme fonksiyonunu ekle
  const handleServiceImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Dosya kontrolü
      if (!file) {
        throw new Error('Lütfen bir görsel seçin');
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        throw new Error('Lütfen geçerli bir görsel dosyası seçin');
      }

      // Dosya boyutu kontrolü (örn: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Görsel boyutu 5MB\'dan küçük olmalıdır');
      }

      // Dosya adı oluştur
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `services/${fileName}`;

      // Görseli yükle
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // State'i güncelle
      setNewService(prev => ({
        ...prev,
        image_path: filePath
      }));

      // Başarılı mesajı göster
      alert('Görsel başarıyla yüklendi!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Görsel yüklenirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Silme fonksiyonunu ekle
  const handleDeleteService = async (service: Service) => {
    // Kullanıcıdan onay al
    if (!window.confirm('Bu bilgilendirmeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setIsLoading(true);

      // Önce görseli sil (eğer varsa)
      if (service.image_path) {
        const { error: storageError } = await supabase.storage
          .from('site-images')
          .remove([service.image_path]);

        if (storageError) throw storageError;
      }

      // Servisi sil
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (error) throw error;

      // Başarılı mesajı göster
      alert('Bilgilendirme başarıyla silindi!');
      
      // Listeyi yenile
      await loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Bilgilendirme silinirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Logo yükleme fonksiyonu
  const handleLogoUpload = async (file: File) => {
    try {
      setIsLoading(true);

      if (!file.type.startsWith('image/')) {
        throw new Error('Lütfen geçerli bir görsel dosyası seçin');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Logo boyutu 2MB\'dan küçük olmalıdır');
      }

      // Önce storage'daki tüm eski logoları listele ve sil
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('site-images')
        .list('logo');

      if (listError) throw listError;

      // Eski dosyaları sil
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `logo/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('site-images')
          .remove(filesToDelete);

        if (deleteError) throw deleteError;
      }

      // Yeni logoyu yükle
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Veritabanındaki tüm logo kayıtlarını sil
      const { error: deleteDbError } = await supabase
        .from('logo_settings')
        .delete()
        .not('id', 'is', null); // Tüm kayıtları sil

      if (deleteDbError) throw deleteDbError;

      // Yeni logo kaydını oluştur
      const { error: insertError } = await supabase
        .from('logo_settings')
        .insert([{
          logo_path: filePath,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      // Logo ayarlarını yeniden yükle
      await loadLogoSettings();

      alert('Logo başarıyla güncellendi!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Logo yüklenirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Partner silme fonksiyonu
  const handleDeletePartner = async (partner: Partner) => {
    if (!window.confirm('Bu iş ortağını silmek istediğinizden emin misiniz?')) return;

    try {
      setIsLoading(true);

      // Logoyu storage'dan sil
      if (partner.logo_path) {
        const { error: storageError } = await supabase.storage
          .from('site-images')
          .remove([partner.logo_path]);

        if (storageError) throw storageError;
      }

      // Partner kaydını sil
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partner.id);

      if (error) throw error;

      alert('İş ortağı başarıyla silindi!');
      await loadPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('İş ortağı silinirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Partner kaydetme/güncelleme fonksiyonu
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (isEditingPartner) {
        // Güncelleme
        const { error } = await supabase
          .from('partners')
          .update({
            name: newPartner.name,
            logo_path: newPartner.logo_path,
            website_url: newPartner.website_url,
            display_order: newPartner.display_order,
            updated_at: new Date()
          })
          .eq('id', isEditingPartner.id);

        if (error) throw error;
        alert('İş ortağı başarıyla güncellendi!');
      } else {
        // Yeni kayıt
        const { error } = await supabase
          .from('partners')
          .insert([{
            ...newPartner,
            created_at: new Date(),
            updated_at: new Date()
          }]);

        if (error) throw error;
        alert('İş ortağı başarıyla eklendi!');
      }

      await loadPartners();
      handleClosePartnerForm();
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('İş ortağı kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Form kapatma fonksiyonu
  const handleClosePartnerForm = () => {
    setIsAddingPartner(false);
    setIsEditingPartner(null);
    setNewPartner({
      name: '',
      logo_path: '',
      website_url: '',
      display_order: partners.length + 1,
      is_active: true
    });
  };

  // SVG'yi normalize eden ve class ekleyen yardımcı fonksiyon
  const normalizeSvg = (svgString: string): string => {
    let normalized = svgString.trim();
    
    // SVG tag'ini bul
    const svgMatch = normalized.match(/<svg[^>]*>/);
    if (!svgMatch) return normalized;
    
    const svgTag = svgMatch[0];
    const restOfSvg = normalized.slice(svgTag.length);
    
    // Mevcut class'ları koru
    const classMatch = svgTag.match(/class="([^"]*)"/);
    const existingClasses = classMatch ? classMatch[1] : '';
    
    // Yeni SVG tag oluştur
    let newSvgTag = svgTag
      // xmlns ekle (eğer yoksa)
      .replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
      // fill ekle (eğer yoksa)
      .replace(/<svg/, '<svg fill="none"')
      // stroke ekle (eğer yoksa)
      .replace(/<svg/, '<svg stroke="currentColor"')
      // class'ları birleştir
      .replace(/class="[^"]*"/, '')
      .replace(/<svg/, `<svg class="w-16 h-16 ${existingClasses}"`);

    return newSvgTag + restOfSvg;
  };

  // İstatistik kaydetme/güncelleme fonksiyonu
  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      if (!isEditingStat && stats.length >= 3) {
        alert('En fazla 3 istatistik eklenebilir!');
        return;
      }

      // SVG'yi normalize et
      const processedStat = {
        ...newStat,
        stat_icon_svg: normalizeSvg(newStat.stat_icon_svg)
      };

      if (isEditingStat) {
        // Güncelleme
        const { error } = await supabase
          .from('stats')
          .update({
            ...processedStat,
            updated_at: new Date()
          })
          .eq('id', isEditingStat.id);

        if (error) throw error;
        alert('İstatistik başarıyla güncellendi!');
      } else {
        // Yeni kayıt
        const { error } = await supabase
          .from('stats')
          .insert([{
            ...processedStat,
            created_at: new Date(),
            updated_at: new Date()
          }]);

        if (error) throw error;
        alert('İstatistik başarıyla eklendi!');
      }

      await loadStats();
      handleCloseStatForm();
    } catch (error) {
      console.error('Error saving stat:', error);
      alert('İstatistik kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Form kapatma fonksiyonu
  const handleCloseStatForm = () => {
    setIsAddingStat(false);
    setIsEditingStat(null);
    setNewStat({
      title: 'RAKAMLARLA BİZ',
      subtitle_first: 'Seyahatin',
      subtitle_second: 'Geleceğini Şekillendiriyoruz',
      stat_value: 0,
      stat_label: '',
      stat_description: '',
      stat_icon_svg: '',
      display_order: stats.length + 1,
      is_active: true
    });
  };

  // İstatistik silme fonksiyonu
  const handleDeleteStat = async (stat: Stat) => {
    if (!window.confirm('Bu istatistiği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('stats')
        .delete()
        .eq('id', stat.id);

      if (error) throw error;

      alert('İstatistik başarıyla silindi!');
      await loadStats();
    } catch (error) {
      console.error('Error deleting stat:', error);
      alert('İstatistik silinirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Harita görseli yükleme fonksiyonu
  const handleMapImageUpload = async (file: File) => {
    try {
      setIsLoading(true);

      if (!file.type.startsWith('image/')) {
        throw new Error('Lütfen geçerli bir görsel dosyası seçin');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Görsel boyutu 5MB\'dan küçük olmalıdır');
      }

      // Önce storage'daki tüm eski harita görsellerini listele ve sil
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('site-images')
        .list('map');

      if (listError) throw listError;

      // Eski dosyaları sil
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `map/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('site-images')
          .remove(filesToDelete);

        if (deleteError) throw deleteError;
      }

      // Yeni harita görselini yükle
      const fileExt = file.name.split('.').pop();
      const fileName = `map-${Date.now()}.${fileExt}`;
      const filePath = `map/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Veritabanındaki tüm eski kayıtları sil
      const { error: deleteDbError } = await supabase
        .from('map_settings')
        .delete()
        .not('id', 'is', null); // Tüm kayıtları sil

      if (deleteDbError) throw deleteDbError;

      // Yeni harita kaydını oluştur
      const { error: insertError } = await supabase
        .from('map_settings')
        .insert([{
          map_image_path: filePath,
          title: 'Türkiye Haritası', // Varsayılan başlık
          subtitle: 'Keşfedilecek Rotalar', // Varsayılan alt başlık
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      // Harita ayarlarını yeniden yükle
      await loadMapSettings();

      alert('Harita görseli başarıyla güncellendi!');
    } catch (error) {
      console.error('Error uploading map image:', error);
      alert('Görsel yüklenirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Harita ayarlarını güncelleme fonksiyonu
  const handleMapSettingsUpdate = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('map_settings')
        .update({
          title: mapSettings.title,
          subtitle: mapSettings.subtitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', mapSettings.id);

      if (error) throw error;

      alert('Harita ayarları başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating map settings:', error);
      alert('Ayarlar güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Haritaya tıklanma işlemi
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewLocation(prev => ({
      ...prev,
      x,
      y
    }));
    setIsAddingLocation(true);
  };

  // Yeni konum ekleme
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fix the type issue by ensuring newLocationData matches MapLocation type
    const newLocationData: MapLocation = {
      id: Date.now().toString(),
      map_id: mapSettings.id || '',  // Ensure map_id is a string, not undefined
      name: newLocation.name || '',
      description: newLocation.description || '',
      x_position: newLocation.x_position || 0,
      y_position: newLocation.y_position || 0,
      is_active: newLocation.is_active || true
    };

    setLocations(prev => [...prev, newLocationData]);
    setIsAddingLocation(false);
    // Fix the property names to match the MapLocation interface
    setNewLocation({ 
      name: '', 
      description: '', 
      x_position: 0, 
      y_position: 0 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ana Sayfa Yönetimi</h1>
      
      {/* Tab navigation - 'brands' seçeneğini kaldır */}
      <div className="flex space-x-4 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {/* Logo tab'ı en başa geldi */}
          <button
            onClick={() => setActiveTab('logo')}
            className={`${
              activeTab === 'logo'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Image className="w-4 h-4 mr-2" />
            Logo Yönetimi
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`${
              activeTab === 'hero'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Layout className="w-4 h-4 mr-2" />
            Hero Yönetimi
          </button>

          {/* Diğer tab'lar aynı kalacak */}
          <button
            onClick={() => setActiveTab('tours')}
            className={`${
              activeTab === 'tours'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Map className="w-4 h-4 mr-2" />
            Popüler Tur Yönetimi
          </button>

          <button
            onClick={() => setActiveTab('information')}
            className={`${
              activeTab === 'information'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Info className="w-4 h-4 mr-2" />
            Bilgilendirme Yönetimi
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`${
              activeTab === 'map'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Map className="w-4 h-4 mr-2" />
            Harita Yönetimi
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`${
              activeTab === 'stats'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            İstatistik Yönetimi
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`${
              activeTab === 'partners'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            İş Ortakları
          </button>
        </nav>
      </div>

      {/* Tab içerikleri - 'brands' case'ini ve ilgili içeriği kaldır */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Mevcut Hero Görünümü */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Layout className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">Mevcut Hero Görünümü</h2>
              </div>
            </div>

            {isInitialLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                  {heroSettings.image_path ? (
                    <img
                      src={getImageUrl(heroSettings.image_path)}
                      alt={heroSettings.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading image');
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#1A2A1A]" />
                </div>

                {/* Content Container */}
                <div className="relative h-full max-w-7xl mx-auto px-4">
                  {/* Hero Content */}
                  <div className="absolute inset-0 flex flex-col justify-center">
                    <div className="max-w-4xl text-white">
                      <h1 className="font-butler font-bold text-5xl lg:text-7xl text-white pt-20">
                        {heroSettings.title || "Anılar yaratmak için seyahat etmek"}
                      </h1>
                      <p className="text-xl mb-6 text-white pt-4">
                        {heroSettings.subtitle || "Hayalinizdeki seyahati birlikte gerçekleştirelim."}
                      </p>
                      <div 
                        className="inline-block underline text-white hover:text-emerald-400 transition cursor-default"
                      >
                        Tekliflerimizi inceleyin
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hero Düzenleme Formu */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Layout className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold">Hero Bölümü Düzenleme</h2>
            </div>

            <div className="space-y-6">
              {/* Görsel Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Görseli
                </label>
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                  {heroSettings.image_path ? (
                    <img
                      src={getImageUrl(heroSettings.image_path)}
                      alt="Hero"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading image');
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="file"
                    id="hero-image"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('hero-image')?.click()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Görsel Seç
                  </button>
                  {heroSettings.image_path && (
                    <button
                      onClick={() => {
                        if (window.confirm('Görseli silmek istediğinizden emin misiniz?')) {
                          setHeroSettings(prev => ({ ...prev, image_path: null }));
                        }
                      }}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Görseli Sil
                    </button>
                  )}
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={heroSettings.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ana başlık"
                  required
                />
              </div>

              {/* Alt Başlık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={heroSettings.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Alt başlık"
                  required
                />
              </div>

              {/* Kaydet Butonu */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'tours' && (
        <div className="space-y-6">
          {/* Metin Ayarları */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Type className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">Bölüm Metin Ayarları</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ana Başlık
                </label>
                <input
                  type="text"
                  value={featuredSettings.title}
                  onChange={(e) => setFeaturedSettings(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Örn: En sevdiğimiz geziler"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={featuredSettings.subtitle}
                  onChange={(e) => setFeaturedSettings(prev => ({
                    ...prev,
                    subtitle: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Örn: Öne Çıkan Turlarımız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={featuredSettings.description}
                  onChange={(e) => setFeaturedSettings(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Bölüm açıklaması..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleFeaturedSettingsSave}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
            </div>
          </div>

          {/* Mevcut Popüler Turlar Yönetimi */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">Popüler Tur Yönetimi</h2>
              </div>
              <div className="text-sm text-gray-500">
                {selectedTours.length}/6 tur seçildi
              </div>
            </div>

            {isToursLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    className={`border rounded-lg overflow-hidden ${
                      tour.popular_tour ? 'border-indigo-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-w-16 aspect-h-9 w-full h-40">
                      <img
                        src={getImageUrl(tour.hero_image_path)}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{tour.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{tour.region}</p>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {tour.short_description}
                      </p>
                      <button
                        onClick={() => handleTourSelection(tour)}
                        className={`w-full px-4 py-2 rounded-md ${
                          tour.popular_tour
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tour.popular_tour ? 'Seçimi Kaldır' : 'Popüler Tur Yap'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'information' && (
        <div className="space-y-6">
          {/* Mevcut Bilgilendirmeler */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Info className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">Mevcut Bilgilendirmeler</h2>
              </div>
              <button
                onClick={() => setIsAddingService(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Bilgilendirme Ekle
              </button>
            </div>

            {isServicesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`border rounded-lg p-4 ${
                      service.is_active ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          {service.icon_svg ? (
                            <div 
                              className="w-6 h-6 text-indigo-600"
                              dangerouslySetInnerHTML={{ __html: service.icon_svg }}
                            />
                          ) : (
                            <Info className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.short_description}</p>
                          <p className="text-sm text-gray-500 mt-2">{service.long_description}</p>
                          {service.image_path && (
                            <div className="mt-3">
                              <img
                                src={getImageUrl(service.image_path)}
                                alt={service.name}
                                className="h-24 w-auto object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleServiceStatusChange(service)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            service.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {service.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bilgilendirme Ekleme Formu */}
          {isAddingService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {isEditMode ? 'Bilgilendirme Düzenle' : 'Yeni Bilgilendirme Ekle'}
                  </h3>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlık
                    </label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kısa Açıklama
                    </label>
                    <input
                      type="text"
                      value={newService.short_description}
                      onChange={(e) => setNewService(prev => ({
                        ...prev,
                        short_description: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detaylı Açıklama
                    </label>
                    <textarea
                      value={newService.long_description}
                      onChange={(e) => setNewService(prev => ({
                        ...prev,
                        long_description: e.target.value
                      }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İkon SVG
                    </label>
                    <textarea
                      value={newService.icon_svg}
                      onChange={(e) => setNewService(prev => ({
                        ...prev,
                        icon_svg: e.target.value
                      }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                      placeholder="<svg>...</svg>"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      SVG kodunu buraya yapıştırın. SVG'nin width ve height özelliklerini kaldırın.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servis Görseli
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {newService.image_path ? (
                          <div className="relative">
                            <img
                              src={getImageUrl(newService.image_path)}
                              alt="Service preview"
                              className="mx-auto h-32 w-auto object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setNewService(prev => ({ ...prev, image_path: '' }))}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                <span>Görsel yükle</span>
                                <input
                                  id="service-image"
                                  name="service-image"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleServiceImageUpload(file);
                                  }}
                                />
                              </label>
                              <p className="pl-1">veya sürükle bırak</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF max 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Kaydediliyor...' : isEditMode ? 'Güncelle' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'map' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Map className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">Harita Yönetimi</h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* Harita Görseli */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Harita Görseli</h3>
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : mapSettings.map_image_path ? (
                    <div className="relative">
                      <img
                        src={getImageUrl(mapSettings.map_image_path)}
                        alt="Türkiye Haritası"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Error loading map image:', e);
                          const imgElement = e.target as HTMLImageElement;
                          console.log('Failed URL:', imgElement.src);
                          imgElement.src = '/placeholder.jpg';
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (window.confirm('Harita görselini silmek istediğinizden emin misiniz?')) {
                            setIsLoading(true);
                            try {
                              if (mapSettings.map_image_path) {
                                await supabase.storage
                                  .from('site-images')
                                  .remove([mapSettings.map_image_path]);
                                
                                // Veritabanını da güncelle
                                await supabase
                                  .from('map_settings')
                                  .update({ 
                                    map_image_path: null,
                                    updated_at: new Date().toISOString()
                                  })
                                  .eq('id', mapSettings.id);
                              }
                              await loadMapSettings();
                              alert('Harita görseli başarıyla silindi!');
                            } catch (error) {
                              console.error('Error deleting map image:', error);
                              alert('Görsel silinirken bir hata oluştu');
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Map className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="map-image"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMapImageUpload(file);
                    }}
                  />
                  <label
                    htmlFor="map-image"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Harita Görseli Seç
                  </label>
                  <p className="text-sm text-gray-500">
                    PNG veya JPG. Max 5MB.
                  </p>
                </div>
              </div>

              {/* Harita Metinleri */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Harita Metinleri</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlık
                    </label>
                    <input
                      type="text"
                      value={mapSettings.title}
                      onChange={(e) => setMapSettings(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Başlık
                    </label>
                    <input
                      type="text"
                      value={mapSettings.subtitle}
                      onChange={(e) => setMapSettings(prev => ({
                        ...prev,
                        subtitle: e.target.value
                      }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Kaydet Butonu */}
              <div className="flex justify-end">
                <button
                  onClick={handleMapSettingsUpdate}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </div>

          {/* Harita Görseli ve Konum Ekleme Aracı */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Harita ve Konumlar</h3>
            
            {mapSettings.map_image_path ? (
              <div className="space-y-4">
                {/* Harita Görüntüsü ve Konumlar */}
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    ref={mapImageRef}
                    src={getImageUrl(mapSettings.map_image_path)}
                    alt="Türkiye Haritası"
                    className="w-full"
                  />
                  
                  {/* Mevcut Konumlar */}
                  {locations.map(location => (
                    <div
                      key={location.id}
                      className="absolute"
                      style={{
                        left: `${location.x_position}%`,
                        top: `${location.y_position}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="relative group">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                          <div className="bg-white p-2 rounded shadow-lg text-sm">
                            <strong>{location.name}</strong>
                            <p className="text-gray-600">{location.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteLocation(location.id!)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hidden group-hover:block"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Konum Ekleme Modu */}
                  {isAddingLocation && (
                    <div
                      className="absolute"
                      style={{
                        left: `${newLocation.x_position}%`,
                        top: `${newLocation.y_position}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Konum Kontrolleri */}
                {isAddingLocation ? (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Konum Adı
                      </label>
                      <input
                        type="text"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        className="w-full border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <input
                        type="text"
                        value={newLocation.description}
                        onChange={(e) => setNewLocation(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        className="w-full border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Yatay Konum: {newLocation.x_position}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newLocation.x_position}
                        onChange={(e) => setNewLocation(prev => ({
                          ...prev,
                          x_position: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Dikey Konum: {newLocation.y_position}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newLocation.y_position}
                        onChange={(e) => setNewLocation(prev => ({
                          ...prev,
                          y_position: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingLocation(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLocation}
                        disabled={!newLocation.name || isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Ekleniyor...' : 'Konumu Ekle'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingLocation(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="w-5 h-5 mr-2 inline-block" />
                    Yeni Konum Ekle
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Önce bir harita görseli yükleyin
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">İstatistik Yönetimi</h2>
              </div>
              <button
                onClick={() => setIsAddingStat(true)}
                disabled={stats.length >= 3}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                İstatistik Ekle
              </button>
            </div>

            {isStatsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="border rounded-lg p-6 relative"
                  >
                    <div 
                      className="w-12 h-12 mb-4 text-indigo-600" // text rengi ekle
                      dangerouslySetInnerHTML={{ 
                        __html: normalizeSvg(stat.stat_icon_svg) 
                      }}
                    />
                    <div className="text-3xl font-bold mb-2">
                      {stat.stat_value.toLocaleString()}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{stat.stat_label}</h3>
                    <p className="text-sm text-gray-600">{stat.stat_description}</p>
                    
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditingStat(stat);
                          setNewStat(stat);
                          setIsAddingStat(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStat(stat)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* İstatistik Ekleme/Düzenleme Modal */}
          {isAddingStat && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {isEditingStat ? 'İstatistik Düzenle' : 'Yeni İstatistik Ekle'}
                  </h3>
                  <button
                    onClick={handleCloseStatForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleStatSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Değer
                      </label>
                      <input
                        type="number"
                        value={newStat.stat_value}
                        onChange={(e) => setNewStat(prev => ({
                          ...prev,
                          stat_value: parseInt(e.target.value)
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etiket
                      </label>
                      <input
                        type="text"
                        value={newStat.stat_label}
                        onChange={(e) => setNewStat(prev => ({
                          ...prev,
                          stat_label: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <input
                      type="text"
                      value={newStat.stat_description}
                      onChange={(e) => setNewStat(prev => ({
                        ...prev,
                        stat_description: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İkon (SVG)
                    </label>
                    <textarea
                      value={newStat.stat_icon_svg}
                      onChange={(e) => setNewStat(prev => ({
                        ...prev,
                        stat_icon_svg: e.target.value
                      }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                      placeholder="<svg>...</svg>"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      SVG kodunu buraya yapıştırın
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseStatForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Kaydediliyor...' : isEditingStat ? 'Güncelle' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">İş Ortakları</h2>
              </div>
              <button
                onClick={() => setIsAddingPartner(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                İş Ortağı Ekle
              </button>
            </div>

            {isPartnersLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className={`border rounded-lg p-4 ${
                      partner.is_active ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={getImageUrl(partner.logo_path)}
                        alt={partner.name}
                        className="h-20 w-auto object-contain mb-4"
                      />
                      <h3 className="font-semibold text-lg mb-2">{partner.name}</h3>
                      {partner.website_url && (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
                        >
                          Website
                        </a>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => {
                            setIsEditingPartner(partner);
                            setNewPartner(partner);
                            setIsAddingPartner(true);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Partner Ekleme/Düzenleme Modal */}
          {isAddingPartner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {isEditingPartner ? 'İş Ortağını Düzenle' : 'Yeni İş Ortağı Ekle'}
                  </h3>
                  <button
                    onClick={handleClosePartnerForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePartnerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İş Ortağı Adı
                    </label>
                    <input
                      type="text"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={newPartner.website_url}
                      onChange={(e) => setNewPartner(prev => ({
                        ...prev,
                        website_url: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {newPartner.logo_path ? (
                          <div className="relative">
                            <img
                              src={getImageUrl(newPartner.logo_path)}
                              alt="Logo preview"
                              className="mx-auto h-32 w-auto object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setNewPartner(prev => ({ ...prev, logo_path: '' }))}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                <span>Logo yükle</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleLogoUpload(file);
                                  }}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG (max 2MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={handleClosePartnerForm}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Kaydediliyor...' : isEditingPartner ? 'Güncelle' : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logo' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Image className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold">Logo Yönetimi</h2>
            </div>

            <div className="space-y-4">
              {/* Mevcut Logo Önizleme */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mevcut Logo</h3>
                <div className="h-20 flex items-center justify-center bg-gray-50 rounded-lg">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  ) : logoSettings.logo_path ? (
                    <div className="relative">
                      <img
                        src={getImageUrl(logoSettings.logo_path)}
                        alt="Site Logo"
                        className="h-16 object-contain"
                        onError={(e) => {
                          console.error('Error loading logo image:', e);
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (window.confirm('Logoyu silmek istediğinizden emin misiniz?')) {
                            setIsLoading(true);
                            try {
                              // Storage'dan sil
                              if (logoSettings.logo_path) {
                                await supabase.storage
                                  .from('site-images')
                                  .remove([logoSettings.logo_path]);
                              }
                              
                              // Veritabanından sil
                              await supabase
                                .from('logo_settings')
                                .delete()
                                .eq('id', logoSettings.id);

                              // State'i güncelle
                              setLogoSettings({ logo_path: null });
                              
                              alert('Logo başarıyla silindi!');
                            } catch (error) {
                              console.error('Error deleting logo:', error);
                              alert('Logo silinirken bir hata oluştu');
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">Logo yüklenmemiş</div>
                  )}
                </div>
              </div>

              {/* Logo Yükleme Formu */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Logo Yükle</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Logo Seç
                  </label>
                  <p className="text-sm text-gray-500">
                    PNG veya JPG. Max 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageManagement;