export interface Tour {
  id: string;
  slug: string;
  title: string;
  region: string;
  duration: string;
  base_price: number;
  short_description: string;
  long_description: string;
  hero_image_path: string;
  created_at?: string;
  tour_type_id: string;
  tour_type?: {
    id: string;
    type: string;
    header_title: string;
  };
}

export interface TourImage {
  id: string;
  tour_id: string;
  storage_path: string;
  alt_text: string;
  image_type: 'hero' | 'gallery' | 'map';
  display_order: number;
  created_at?: string;
}

export interface TourHighlight {
  id: string;
  tour_id: string;
  content: string;
  display_order: number;
  created_at?: string;
}

export interface TourInclusion {
  id: string;
  tour_id: string;
  content: string;
  display_order: number;
  created_at?: string;
}

export interface TourTip {
  id: string;
  tour_id: string;
  content: string;
  icon_name: string;
  created_at?: string;
}

export interface TourDailyProgram {
  id: string;
  tour_id: string;
  day_range: string;
  title: string;
  content: string;
  created_at?: string;
}

export interface TourDatePrice {
  id: string;
  tour_id: string;
  travel_period: string;
  price_category: string;
  airline: string;
  price: number;
  created_at?: string;
}

export interface TourWeatherData {
  id: string;
  tour_id: string;
  month: string;
  temperature: number;
  rainfall: number;
  is_best_period: boolean;
  created_at?: string;
} 