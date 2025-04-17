import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase storage bucket'ları
export const STORAGE_BUCKETS = {
  TOUR_COVERS: 'tour-covers',
  TOUR_IMAGES: 'tour-images',
} as const;

// Görsel tipleri
export const IMAGE_TYPES = {
  HERO: 'hero',
  GALLERY: 'gallery',
  MAP: 'map',
} as const;

// Fiyat kategorileri
export const PRICE_CATEGORIES = {
  STANDARD: 'Standart',
  BUDGET: 'Bütçe',
  PREMIUM: 'Üst Segment',
} as const;

// Aylar
export const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
] as const; 