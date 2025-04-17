import React, { useState } from 'react';
import { 
  Save, 
  Image, 
  MapPin, 
  Globe, 
  Flag, 
  Sun, 
  CloudRain, 
  Clock, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Camera, 
  Trash2,
  Plus,
  User,
  BarChart2
} from 'lucide-react';

interface NewDestinationFormProps {
  onClose: () => void;
}

const NewDestinationForm: React.FC<NewDestinationFormProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [attractions, setAttractions] = useState([
    { id: 1, name: '', description: '' }
  ]);
  const [activities, setActivities] = useState([
    { id: 1, name: '', description: '' }
  ]);
  const [cuisines, setCuisines] = useState([
    { id: 1, name: '', description: '' }
  ]);
  const [accommodations, setAccommodations] = useState([
    { id: 1, name: '', type: '', description: '' }
  ]);
  const [travelTips, setTravelTips] = useState([
    { id: 1, title: '', description: '' }
  ]);
  const [weatherData, setWeatherData] = useState([
    { month: 'Ocak', temperature: '', rainfall: '', highSeason: false },
    { month: 'Şubat', temperature: '', rainfall: '', highSeason: false },
    { month: 'Mart', temperature: '', rainfall: '', highSeason: false },
    { month: 'Nisan', temperature: '', rainfall: '', highSeason: true },
    { month: 'Mayıs', temperature: '', rainfall: '', highSeason: true },
    { month: 'Haziran', temperature: '', rainfall: '', highSeason: true },
    { month: 'Temmuz', temperature: '', rainfall: '', highSeason: true },
    { month: 'Ağustos', temperature: '', rainfall: '', highSeason: true },
    { month: 'Eylül', temperature: '', rainfall: '', highSeason: false },
    { month: 'Ekim', temperature: '', rainfall: '', highSeason: false },
    { month: 'Kasım', temperature: '', rainfall: '', highSeason: false },
    { month: 'Aralık', temperature: '', rainfall: '', highSeason: false }
  ]);
  const [consultant, setConsultant] = useState({
    name: 'Emily',
    title: 'Seyahat danışmanı',
    bio: 'Meksika ve Latin Amerika uzmanı, 5 yıllık deneyim',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  // Add new attraction
  const addAttraction = () => {
    const newId = attractions.length > 0 ? Math.max(...attractions.map(a => a.id)) + 1 : 1;
    setAttractions([...attractions, { id: newId, name: '', description: '' }]);
  };

  // Remove attraction
  const removeAttraction = (id: number) => {
    setAttractions(attractions.filter(a => a.id !== id));
  };

  // Add new activity
  const addActivity = () => {
    const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
    setActivities([...activities, { id: newId, name: '', description: '' }]);
  };

  // Remove activity
  const removeActivity = (id: number) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  // Add new cuisine
  const addCuisine = () => {
    const newId = cuisines.length > 0 ? Math.max(...cuisines.map(c => c.id)) + 1 : 1;
    setCuisines([...cuisines, { id: newId, name: '', description: '' }]);
  };

  // Remove cuisine
  const removeCuisine = (id: number) => {
    setCuisines(cuisines.filter(c => c.id !== id));
  };

  // Add new accommodation
  const addAccommodation = () => {
    const newId = accommodations.length > 0 ? Math.max(...accommodations.map(a => a.id)) + 1 : 1;
    setAccommodations([...accommodations, { id: newId, name: '', type: '', description: '' }]);
  };

  // Remove accommodation
  const removeAccommodation = (id: number) => {
    setAccommodations(accommodations.filter(a => a.id !== id));
  };

  // Add new travel tip
  const addTravelTip = () => {
    const newId = travelTips.length > 0 ? Math.max(...travelTips.map(t => t.id)) + 1 : 1;
    setTravelTips([...travelTips, { id: newId, title: '', description: '' }]);
  };

  // Remove travel tip
  const removeTravelTip = (id: number) => {
    setTravelTips(travelTips.filter(t => t.id !== id));
  };

  // Toggle high season for a month
  const toggleHighSeason = (index: number) => {
    const newWeatherData = [...weatherData];
    newWeatherData[index].highSeason = !newWeatherData[index].highSeason;
    setWeatherData(newWeatherData);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the form submission
    // For now, we'll just close the form
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-7xl mx-auto">
      <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold">Yeni Destinasyon Ekle</h2>
        <button 
          type="button" 
          className="text-white hover:text-gray-200"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div className="flex border-b border-gray-200">
        <nav className="flex overflow-x-auto py-4 px-6 bg-gray-50">
          <button
            onClick={() => setActiveTab('general')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'general'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'images'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Görseller
          </button>
          <button
            onClick={() => setActiveTab('attractions')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'attractions'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Gezilecek Yerler
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'activities'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Aktiviteler
          </button>
          <button
            onClick={() => setActiveTab('cuisine')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'cuisine'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Yemek Kültürü
          </button>
          <button
            onClick={() => setActiveTab('accommodation')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'accommodation'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Konaklama
          </button>
          <button
            onClick={() => setActiveTab('travelTips')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'travelTips'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Seyahat İpuçları
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md mr-2 ${
              activeTab === 'weather'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hava Durumu
          </button>
          <button
            onClick={() => setActiveTab('consultant')}
            className={`whitespace-nowrap px-4 py-2 font-medium text-sm rounded-md ${
              activeTab === 'consultant'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Seyahat Danışmanı
          </button>
        </nav>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* General Information */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Genel Destinasyon Bilgileri</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="destinationName" className="block text-sm font-medium text-gray-700 mb-1">
                  Destinasyon Adı
                </label>
                <input
                  type="text"
                  id="destinationName"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Örn: Meksika"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Ülke
                  </label>
                  <input
                    type="text"
                    id="country"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Örn: Meksika"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Bölge
                  </label>
                  <input
                    type="text"
                    id="region"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Örn: Latin Amerika"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Kısa Açıklama
                </label>
                <input
                  type="text"
                  id="shortDescription"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Örn: Antik Maya uygarlığı ve muhteşem plajlarıyla ünlü"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Detaylı Açıklama
                </label>
                <textarea
                  id="longDescription"
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Destinasyon hakkında detaylı bilgi (kültür, tarih, coğrafya, vb.)"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Para Birimi
                  </label>
                  <input
                    type="text"
                    id="currency"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Örn: Meksika Pesosu (MXN)"
                  />
                </div>
                
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Dil
                  </label>
                  <input
                    type="text"
                    id="language"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Örn: İspanyolca"
                  />
                </div>
                
                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-1">
                    Saat Dilimi
                  </label>
                  <input
                    type="text"
                    id="timeZone"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Örn: GMT-6"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="popularity" className="block text-sm font-medium text-gray-700 mb-1">
                  Popülerlik
                </label>
                <select
                  id="popularity"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="Yüksek">Yüksek</option>
                  <option value="Orta">Orta</option>
                  <option value="Düşük">Düşük</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  id="status"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Destination Images */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Destinasyon Görselleri</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapak Fotoğrafı
                </label>
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md">
                  <div className="space-y-2 text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="cover-photo" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Görsel yüklemek için tıklayın</span>
                        <input id="cover-photo" name="cover-photo" type="file" className="sr-only" accept="image/*" />
                      </label>
                      <p className="pl-1">veya sürükleyin</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF formatında maksimum 5MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Galeri Görselleri
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className="border-2 border-dashed border-gray-300 p-4 rounded-md">
                      <div className="space-y-2 text-center">
                        <Image className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <label htmlFor={`gallery-photo-${index}`} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Görsel {index}</span>
                            <input id={`gallery-photo-${index}`} name={`gallery-photo-${index}`} type="file" className="sr-only" accept="image/*" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harita Görseli
                </label>
                <div className="border-2 border-dashed border-gray-300 p-6 rounded-md">
                  <div className="space-y-2 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="map-image" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Harita görseli yükleyin</span>
                        <input id="map-image" name="map-image" type="file" className="sr-only" accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Destinasyonun harita görselini yükleyin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Attractions */}
        {activeTab === 'attractions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Gezilecek Yerler</h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                onClick={addAttraction}
              >
                <Plus className="w-4 h-4 mr-1" />
                Yeni Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {attractions.map((attraction, index) => (
                <div key={attraction.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">Gezilecek Yer {index + 1}</h4>
                    {attractions.length > 1 && (
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeAttraction(attraction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor={`attraction-name-${attraction.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Yer Adı
                      </label>
                      <input
                        type="text"
                        id={`attraction-name-${attraction.id}`}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Örn: Chichen Itza"
                        value={attraction.name}
                        onChange={(e) => {
                          const newAttractions = [...attractions];
                          newAttractions[index].name = e.target.value;
                          setAttractions(newAttractions);
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`attraction-desc-${attraction.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        id={`attraction-desc-${attraction.id}`}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Gezilecek yer hakkında kısa açıklama"
                        value={attraction.description}
                        onChange={(e) => {
                          const newAttractions = [...attractions];
                          newAttractions[index].description = e.target.value;
                          setAttractions(newAttractions);
                        }}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Görsel
                      </label>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="relative bg-indigo-600 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none">
                            <span>Görsel Yükle</span>
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept="image/*"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Activities */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Aktiviteler</h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                onClick={addActivity}
              >
                <Plus className="w-4 h-4 mr-1" />
                Yeni Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">Aktivite {index + 1}</h4>
                    {activities.length > 1 && (
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeActivity(activity.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor={`activity-name-${activity.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Aktivite Adı
                      </label>
                      <input
                        type="text"
                        id={`activity-name-${activity.id}`}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Örn: Cenote Yüzme"
                        value={activity.name}
                        onChange={(e) => {
                          const newActivities = [...activities];
                          newActivities[index].name = e.target.value;
                          setActivities(newActivities);
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`activity-desc-${activity.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        id={`activity-desc-${activity.id}`}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Aktivite hakkında kısa açıklama"
                        value={activity.description}
                        onChange={(e) => {
                          const newActivities = [...activities];
                          newActivities[index].description = e.target.value;
                          setActivities(newActivities);
                        }}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Görsel
                      </label>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="relative bg-indigo-600 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none">
                            <span>Görsel Yükle</span>
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept="image/*"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Cuisine */}
        {activeTab === 'cuisine' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Yemek Kültürü</h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                onClick={addCuisine}
              >
                <Plus className="w-4 h-4 mr-1" />
                Yeni Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {cuisines.map((cuisine, index) => (
                <div key={cuisine.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">Yemek Kültürü {index + 1}</h4>
                    {cuisines.length > 1 && (
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeCuisine(cuisine.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor={`cuisine-name-${cuisine.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Yemek Kültürü Adı
                      </label>
                      <input
                        type="text"
                        id={`cuisine-name-${cuisine.id}`}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Örn: Meksika Köfte"
                        value={cuisine.name}
                        onChange={(e) => {
                          const newCuisines = [...cuisines];
                          newCuisines[index].name = e.target.value;
                          setCuisines(newCuisines);
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`cuisine-desc-${cuisine.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        id={`cuisine-desc-${cuisine.id}`}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Yemek kültürü hakkında kısa açıklama"
                        value={cuisine.description}
                        onChange={(e) => {
                          const newCuisines = [...cuisines];
                          newCuisines[index].description = e.target.value;
                          setCuisines(newCuisines);
                        }}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Add form submit button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDestinationForm;