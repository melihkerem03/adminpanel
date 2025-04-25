// Web sitesindeki yaklaşımı kullanarak görselleri doğrudan Supabase'den alma
import { supabase } from '../supabaseClient'; // Supabase istemcinizi içe aktarın

export const getStorageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  if (path.startsWith('http')) {
    return path;
  }

  // Web sitesindeki gibi doğrudan supabase nesnesini kullan
  return supabase.storage
    .from('site-images') // Web sitesinde kullanılan bucket ismini kullan
    .getPublicUrl(path)
    .data.publicUrl;
}; 