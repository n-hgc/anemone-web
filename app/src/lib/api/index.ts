// API抽象化レイヤー
// 将来的にWordPress REST APIに移行する際の変更を最小限に抑える

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SalonFilters {
  prefecture?: string;
  city?: string;
  service_type?: string;
  search?: string;
}

export interface NewsFilters {
  category?: string;
  tag?: string;
  search?: string;
}

// データソースの設定
const API_CONFIG = {
  // 開発環境ではモックデータを使用
  useMockData: true,
  // 将来的にWordPress REST APIに切り替え
  wpApiUrl: process.env.WP_API_URL || 'https://wp.example.com/wp-json/wp/v2',
  // キャッシュ設定
  cacheTimeout: 5 * 60 * 1000, // 5分
};

// キャッシュストレージ（ブラウザ環境でのみ使用）
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * キャッシュからデータを取得
 */
function getFromCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > API_CONFIG.cacheTimeout) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

/**
 * データをキャッシュに保存
 */
function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * モックデータをインポート
 */
async function getMockData<T>(type: string): Promise<T> {
  switch (type) {
    case 'salons':
      return (await import('../../data/salons.json')).default;
    case 'news':
      return (await import('../../data/news.json')).default;
    case 'prefectures':
      return (await import('../../data/prefectures.json')).default;
    default:
      throw new Error(`Unknown data type: ${type}`);
  }
}

/**
 * WordPress REST APIからデータを取得
 */
async function getWpData<T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T> {
  const url = new URL(`${API_CONFIG.wpApiUrl}/${endpoint}`);
  
  // パラメータをクエリに追加
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      // 将来的に認証が必要な場合
      ...(process.env.WP_API_TOKEN && {
        'Authorization': `Bearer ${process.env.WP_API_TOKEN}`
      })
    }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * データ取得の共通関数
 */
async function fetchData<T>(
  type: string,
  params: Record<string, any> = {},
  useCache: boolean = true
): Promise<ApiResponse<T>> {
  try {
    const cacheKey = `${type}_${JSON.stringify(params)}`;
    
    // キャッシュから取得を試行
    if (useCache) {
      const cached = getFromCache<T>(cacheKey);
      if (cached) {
        return {
          data: cached,
          success: true
        };
      }
    }
    
    let data: T;
    
    if (API_CONFIG.useMockData) {
      // モックデータを使用
      data = await getMockData<T>(type);
    } else {
      // WordPress REST APIを使用
      data = await getWpData<T>(type, params);
    }
    
    // キャッシュに保存
    if (useCache) {
      setCache(cacheKey, data);
    }
    
    return {
      data,
      success: true
    };
    
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return {
      data: null as T,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 公開API関数
export const api = {
  /**
   * 店舗一覧を取得
   */
  async getSalons(filters: SalonFilters = {}): Promise<ApiResponse<any[]>> {
    return fetchData('salons', filters);
  },
  
  /**
   * 特定の店舗を取得
   */
  async getSalon(id: number): Promise<ApiResponse<any>> {
    const response = await fetchData('salons');
    if (response.success && Array.isArray(response.data)) {
      const salon = response.data.find((s: any) => s.id === id);
      return {
        data: salon || null,
        success: !!salon,
        message: salon ? undefined : 'Salon not found'
      };
    }
    return response;
  },
  
  /**
   * ニュース一覧を取得
   */
  async getNews(filters: NewsFilters = {}): Promise<ApiResponse<any[]>> {
    return fetchData('news', filters);
  },
  
  /**
   * 特定のニュースを取得
   */
  async getNewsItem(id: number): Promise<ApiResponse<any>> {
    const response = await fetchData('news');
    if (response.success && Array.isArray(response.data)) {
      const newsItem = response.data.find((n: any) => n.id === id);
      return {
        data: newsItem || null,
        success: !!newsItem,
        message: newsItem ? undefined : 'News item not found'
      };
    }
    return response;
  },
  
  /**
   * 都道府県一覧を取得
   */
  async getPrefectures(): Promise<ApiResponse<any[]>> {
    return fetchData('prefectures');
  },
  
  /**
   * データソースを切り替え
   */
  switchToWordPress(apiUrl: string): void {
    API_CONFIG.useMockData = false;
    API_CONFIG.wpApiUrl = apiUrl;
  },
  
  /**
   * モックデータに戻す
   */
  switchToMockData(): void {
    API_CONFIG.useMockData = true;
  },
  
  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    cache.clear();
  }
};
