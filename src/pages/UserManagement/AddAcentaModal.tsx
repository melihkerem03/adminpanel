import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  created_at?: string;
  updated_at?: string;
  password_hash?: string;
}

interface AddAcentaModalProps {
  onClose: () => void;
  onSave: () => void;
  acenta: AcentaData | null;
}

const AddAcentaModal: React.FC<AddAcentaModalProps> = ({ onClose, onSave, acenta }) => {
  const [formData, setFormData] = useState<Partial<AcentaData>>({
    acenta_ismi: '',
    isim: '',
    soyisim: '',
    email: '',
    telefon: '',
    mobil_telefon: '',
    ulke: '',
    sehir: '',
    adres: '',
    cinsiyet: ''
  });
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (acenta) {
      setFormData({
        acenta_ismi: acenta.acenta_ismi || '',
        isim: acenta.isim || '',
        soyisim: acenta.soyisim || '',
        email: acenta.email || '',
        telefon: acenta.telefon || '',
        mobil_telefon: acenta.mobil_telefon || '',
        ulke: acenta.ulke || '',
        sehir: acenta.sehir || '',
        adres: acenta.adres || '',
        cinsiyet: acenta.cinsiyet || ''
      });
    }
  }, [acenta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.acenta_ismi || !formData.isim || !formData.soyisim) {
        throw new Error('Acenta ismi, E-posta, Ad ve Soyad alanları zorunludur');
      }

      if (acenta) {
        // Acenta güncelleme
        const { error } = await supabase
          .from('acentalar')
          .update({
            acenta_ismi: formData.acenta_ismi,
            isim: formData.isim,
            soyisim: formData.soyisim,
            telefon: formData.telefon,
            mobil_telefon: formData.mobil_telefon,
            ulke: formData.ulke,
            sehir: formData.sehir,
            adres: formData.adres,
            cinsiyet: formData.cinsiyet,
            updated_at: new Date().toISOString()
          })
          .eq('id', acenta.id);

        if (error) throw error;
      } else {
        // Yeni acenta oluşturma
        if (!password) {
          throw new Error('Yeni acenta için şifre gereklidir');
        }

        // Şifre hash'leme işlemi (gerçek uygulamada backend tarafında yapılmalıdır)
        // Bu örnek için basit bir çözüm:
        const passwordHash = password; // Gerçek uygulamada hash'lenmelidir

        const { error } = await supabase
          .from('acentalar')
          .insert({
            acenta_ismi: formData.acenta_ismi,
            isim: formData.isim,
            soyisim: formData.soyisim,
            email: formData.email,
            telefon: formData.telefon,
            mobil_telefon: formData.mobil_telefon,
            ulke: formData.ulke,
            sehir: formData.sehir,
            adres: formData.adres,
            cinsiyet: formData.cinsiyet,
            password_hash: passwordHash,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Acenta kaydedilirken hata:', error);
      setError(error.message || 'Acenta kaydedilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {acenta ? 'Acenta Düzenle' : 'Yeni Acenta Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-gray-700 mb-3">Acenta Bilgileri</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="acenta_ismi" className="block text-sm font-medium text-gray-700">
                  Acenta İsmi *
                </label>
                <input
                  type="text"
                  id="acenta_ismi"
                  name="acenta_ismi"
                  value={formData.acenta_ismi}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-gray-700 mb-3">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="isim" className="block text-sm font-medium text-gray-700">
                  Ad *
                </label>
                <input
                  type="text"
                  id="isim"
                  name="isim"
                  value={formData.isim}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="soyisim" className="block text-sm font-medium text-gray-700">
                  Soyad *
                </label>
                <input
                  type="text"
                  id="soyisim"
                  name="soyisim"
                  value={formData.soyisim}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                  disabled={!!acenta} // Mevcut acenta düzenlenirken email değiştirilemez
                />
              </div>

              <div>
                <label htmlFor="cinsiyet" className="block text-sm font-medium text-gray-700">
                  Cinsiyet
                </label>
                <select
                  id="cinsiyet"
                  name="cinsiyet"
                  value={formData.cinsiyet}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Seçiniz</option>
                  <option value="erkek">Erkek</option>
                  <option value="kadın">Kadın</option>
                  <option value="diğer">Diğer</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-gray-700 mb-3">İletişim Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="mobil_telefon" className="block text-sm font-medium text-gray-700">
                  Mobil Telefon
                </label>
                <input
                  type="tel"
                  id="mobil_telefon"
                  name="mobil_telefon"
                  value={formData.mobil_telefon}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-gray-700 mb-3">Adres Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ulke" className="block text-sm font-medium text-gray-700">
                  Ülke
                </label>
                <input
                  type="text"
                  id="ulke"
                  name="ulke"
                  value={formData.ulke}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="sehir" className="block text-sm font-medium text-gray-700">
                  Şehir
                </label>
                <input
                  type="text"
                  id="sehir"
                  name="sehir"
                  value={formData.sehir}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="adres" className="block text-sm font-medium text-gray-700">
                  Adres
                </label>
                <textarea
                  id="adres"
                  name="adres"
                  rows={3}
                  value={formData.adres}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>

          {!acenta && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-medium text-gray-700 mb-3">Güvenlik</h3>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre *
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required={!acenta}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? 'Kaydediliyor...' : (acenta ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAcentaModal; 