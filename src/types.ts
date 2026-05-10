export interface User {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  home_city?: string;
  photo_url?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_photo?: string;
  is_public: boolean;
  created_at: number;
}

export interface TripStop {
  id: string;
  trip_id: string;
  city_name: string;
  country_code: string;
  arrival_date: string;
  departure_date: string;
  order_index: number;
}

export interface Activity {
  id: string;
  stop_id: string;
  name: string;
  category: string;
  cost: number;
  time?: string;
  notes?: string;
}

export interface Budget {
  total: number;
  spent: number;
  categories: Record<string, number>;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  name: string;
  category: 'Clothing' | 'Electronics' | 'Documents' | 'Essentials';
  is_packed: boolean;
}

export interface TripNote {
  id: string;
  trip_id: string;
  content: string;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}
