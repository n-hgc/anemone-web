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

// WordPress REST API用の型定義
export interface WpPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: Record<string, any>;
}

// WordPress REST API用のメディア型定義
export interface WpMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: Record<string, any>;
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: Record<string, {
      file: string;
      width: number;
      height: number;
      mime_type: string;
      source_url: string;
    }>;
    image_meta: Record<string, any>;
  };
  source_url: string;
  _links: Record<string, any>;
}

// WordPress REST API用のカテゴリ型定義
export interface WpCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

// WordPress REST API用のタグ型定義
export interface WpTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

// WordPress REST API用のニュース型定義
export interface WpNews extends WpPost {
  acf?: {
    featured_image?: number;
    categories?: string[];
    tags?: string[];
  };
}

// salons.index.json用の型定義
export interface SalonIndexData {
  id: number;
  title: string;
  furigana: string;
  thumb: string;
  region: Array<{ slug: string; name: string }>;
  prefecture: Array<{ slug: string; name: string }>;
  city: Array<{ slug: string; name: string }>;
  job_role: Array<{ slug: string; name: string }>;
  employment_type: Array<{ slug: string; name: string }>;
  is_hiring: boolean;
  reservation_url: string;
  maps_url: string;
  access: string;
}

// レガシー形式のSalon型定義（JSONデータ用）
export interface LegacySalon {
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
  gmb_place_id: string;
}

// ヘアスタイル（フラット配列）用の型定義
export interface HairstyleItem {
  id: number;
  hairType: 'short' | 'medium' | 'long' | 'mens';
  imageUrl: string;
  alt: string;
}

// Instagram API用の型定義
export interface InstagramApiItem {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  featured_media: number;
  template: string;
  meta: any[];
  custom_fields: {
    subtitle: string | null;
    hero_image: string | null;
    'salon-staff-list': string | null;
  };
  acf: {
    url: string;
  };
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    'wp:featuredmedia': Array<{ embeddable: boolean; href: string }>;
    'wp:attachment': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

// Instagram用の変換後型定義
export interface InstagramItem {
  id: number;
  title: string;
  slug: string;
  imageUrl: string;
  instagramUrl: string;
  date: string;
  featured_media_id: number;
  alt: string;
}
