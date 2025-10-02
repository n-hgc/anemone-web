// 店舗の型定義（WordPress REST API形式に対応）
export interface Salon {
  id: number;
  title: string;
  slug: string;
  status: 'publish' | 'draft' | 'private';
  content: string;
  excerpt: string;
  featured_media: number;
  acf: {
    address: string;
    tel: string;
    hours: string;
    payment: string;
    facilities: string[];
    geo: {
      lat: number;
      lng: number;
    };
    reservation_url: string;
    gmb_place_id?: string;
  };
  meta: {
    prefecture: string;
    city: string;
    service_types: string[];
  };
  images: SalonImage[];
  created_at: string;
  updated_at: string;
}

// 店舗画像の型定義
export interface SalonImage {
  id: number;
  url: string;
  alt: string;
  sizes: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

// レガシー形式との互換性のための変換関数
export function convertSalonToLegacy(salon: Salon) {
  return {
    id: salon.id,
    name: salon.title,
    address: salon.acf.address,
    tel: salon.acf.tel,
    hours: salon.acf.hours,
    payment: salon.acf.payment,
    facilities: salon.acf.facilities,
    geo: salon.acf.geo,
    prefecture: salon.meta.prefecture,
    city: salon.meta.city,
    photos: salon.images.map(img => img.url),
    reservation_url: salon.acf.reservation_url,
    gmb_place_id: salon.acf.gmb_place_id
  };
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
