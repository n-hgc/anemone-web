// 店舗の型定義
export interface Salon {
  id: number;
  name: string;
  address: string;
  tel: string;
  hours: string;
  payment: string;
  facilities: string[];
  geo: {
    lat: number;
    lng: number;
  };
  prefecture: string;
  city: string;
  photos: string[];
  reservation_url: string;
  gmb_place_id?: string;
}

// メニューの型定義
export interface Menu {
  id: number;
  title: string;
  price: number;
  duration: number; // 分
  target: string;
  options: string[];
  notes: string;
}

// スタッフの型定義
export interface Staff {
  id: number;
  name: string;
  role: string;
  specialty: string[];
  salons: number[];
  sns: {
    instagram?: string;
    twitter?: string;
  };
}

// キャンペーンの型定義
export interface Campaign {
  id: number;
  period: {
    start: string;
    end: string;
  };
  target_salons: number[];
  image: string;
  copy: string;
}

// ニュース/ブログの型定義
export interface News {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  categories: string[];
  tags: string[];
  featured_image?: string;
  slug: string;
}

// 求人の型定義
export interface Job {
  id: number;
  title: string;
  employment_type: string;
  role: string;
  salary: string;
  benefits: string[];
  requirements: string[];
  process: string[];
  location: number; // salon id
  apply_url: string;
}

// 都道府県・市区の型定義
export interface Prefecture {
  id: string;
  name: string;
  cities: string[];
}

// 検索フィルターの型定義
export interface SearchFilters {
  prefecture?: string;
  city?: string;
  service_type?: string;
  query?: string;
}
