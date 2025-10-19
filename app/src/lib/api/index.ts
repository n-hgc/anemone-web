// API抽象化レイヤー
// 将来的にWordPress REST APIに移行する際の変更を最小限に抑える

import type { 
  WpPost, 
  WpMedia, 
  WpCategory, 
  WpTag, 
  WpNews,
  LegacySalon,
  News as LegacyNews
} from '../../types';

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
  useMockData: process.env.NODE_ENV === 'development' && !process.env.WP_API_URL,
  // WordPress REST APIのURL
  wpApiUrl: process.env.WP_API_URL || 'https://anemone-salon.com/wp-json/wp/v2',
  // キャッシュ設定
  cacheTimeout: 5 * 60 * 1000, // 5分
  // WordPress 5.8認証設定（Basic認証のみ）
  wpAuth: {
    username: process.env.WP_BASIC_AUTH_USERNAME,
    password: process.env.WP_BASIC_AUTH_PASSWORD
  }
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
 * WordPress REST APIからデータを取得（WordPress 5.8対応）
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
  
  // WordPress 5.8対応: ACFフィールドを含める
  // 一時的にコメントアウトしてテスト
  // url.searchParams.append('_fields', 'id,title,content,excerpt,date,slug,featured_media,meta,acf');
  
  // 認証ヘッダーの準備
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // WordPress 5.8対応: Basic認証のみサポート
  // シンプルなfetchテストでは認証なしで成功しているので、認証はオプションにする
  if (API_CONFIG.wpAuth.username && API_CONFIG.wpAuth.password) {
    const credentials = btoa(`${API_CONFIG.wpAuth.username}:${API_CONFIG.wpAuth.password}`);
    headers['Authorization'] = `Basic ${credentials}`;
    console.log('Basic認証を使用します');
  } else {
    console.log('認証なしでリクエストします');
  }
  
  // デバッグ情報を出力
  console.log('=== API抽象化レイヤーでのリクエスト ===');
  console.log('環境変数:', {
    WP_API_URL: process.env.WP_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    useMockData: API_CONFIG.useMockData,
    wpApiUrl: API_CONFIG.wpApiUrl
  });
  console.log('WordPress API Request:', {
    url: url.toString(),
    headers,
    endpoint,
    params
  });
  console.log('シンプルなfetchテストとの違いを確認してください');
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('WordPress API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('WordPress API Data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('WordPress API Error Response:', errorText);
      throw new Error(`WordPress API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
  } catch (error) {
    console.error('WordPress API Fetch Error:', error);
    throw error;
  }
}

/**
 * WordPress REST API用のデータ変換関数
 */
function convertWpPostToLegacyNews(wpPost: any): LegacyNews {
  return {
    id: wpPost.id,
    title: wpPost.title.rendered,
    content: wpPost.content.rendered,
    excerpt: wpPost.excerpt.rendered,
    date: wpPost.date,
    categories: [], // 後でカテゴリAPIから取得
    tags: [], // 後でタグAPIから取得
    featured_image: wpPost.featured_media ? undefined : undefined, // 後でメディアAPIから取得
    slug: wpPost.slug
  };
}

/**
 * WordPress REST API用の店舗データ変換関数（WordPress 5.8対応）
 */
function convertWpPostToLegacySalon(wpPost: any): LegacySalon {
  console.log('=== convertWpPostToLegacySalon 開始 ===');
  console.log('元のwpPost:', wpPost);
  
  // データ構造の検証
  if (!wpPost) {
    console.error('wpPostがundefinedまたはnullです');
    throw new Error('wpPost is undefined or null');
  }
  
  console.log('wpPostの構造:', {
    id: wpPost.id,
    title: wpPost.title,
    titleType: typeof wpPost.title,
    hasRendered: wpPost.title && 'rendered' in wpPost.title,
    acf: wpPost.acf
  });
  
  if (!wpPost.title) {
    console.error('wpPost.titleがundefinedです:', wpPost);
    throw new Error('wpPost.title is undefined');
  }
  
  if (!wpPost.title.rendered) {
    console.error('wpPost.title.renderedがundefinedです:', {
      title: wpPost.title,
      titleType: typeof wpPost.title,
      titleKeys: wpPost.title ? Object.keys(wpPost.title) : 'N/A'
    });
    throw new Error('wpPost.title.rendered is undefined');
  }
  
  // WordPress 5.8ではACFフィールドがacfプロパティに含まれる
  const acf = wpPost.acf || {};
  console.log('ACFデータ:', acf);
  
  // 住所の取得（複数のフィールドから試行）
  const address = acf['salon-address'] || acf.address || '';
  
  // 電話番号の取得
  const tel = acf['salon-tel'] || acf.tel || '';
  
  // 営業時間の取得
  const hours = acf['salon-access']?.open || acf.hours || '';
  
  // 都道府県の取得
  const prefecture = acf['salon-prefecture']?.label || acf.prefecture || '';
  
  // 予約URLの取得
  const reservationUrl = acf['salon-preorder-url'] || acf.reservation_url || '';
  
  console.log('抽出されたフィールド:', {
    address,
    tel,
    hours,
    prefecture,
    reservationUrl
  });
  
  // 画像の取得（KVリストから）
  const photos = acf['salon-kv-list']?.map((kv: any) => {
    // 画像IDから実際のURLを取得する必要がある場合
    return kv.image ? `https://anemone-salon.com/wp-content/uploads/2024/01/salon-image-${kv.image}.jpg` : '';
  }).filter(Boolean) || [];
  
  console.log('写真URLs:', photos);
  
  // 施設情報の取得（メニューから推測）
  const facilities = [];
  if (acf['salon-menu']) {
    console.log('メニュー内容:', acf['salon-menu']);
    if (acf['salon-menu'].includes('完全個室')) facilities.push('完全個室');
    if (acf['salon-menu'].includes('キッズスペース')) facilities.push('キッズスペース');
    if (acf['salon-menu'].includes('Wi-Fi')) facilities.push('Wi-Fi');
    if (acf['salon-menu'].includes('駐車場')) facilities.push('駐車場');
  }
  
  console.log('施設情報:', facilities);
  
  const result = {
    id: wpPost.id || 0,
    name: wpPost.title?.rendered || wpPost.title || 'タイトルなし',
    address: address,
    tel: tel,
    hours: hours,
    payment: '現金、クレジットカード、電子マネー', // デフォルト値
    facilities: facilities,
    geo: { lat: 0, lng: 0 }, // デフォルト値（後でGoogle Mapsから取得可能）
    prefecture: prefecture,
    city: '', // 住所から抽出可能だが、現在は空
    photos: photos,
    reservation_url: reservationUrl,
    gmb_place_id: '' // デフォルト値
  };
  
  console.log('変換結果:', result);
  console.log('=== convertWpPostToLegacySalon 終了 ===');
  
  return result;
}

/**
 * シンプルなfetchテスト（API抽象化レイヤーをバイパス）
 */
async function simpleFetchTest(): Promise<ApiResponse<any[]>> {
  try {
    console.log('=== シンプルなfetchテスト開始（API抽象化レイヤーをバイパス） ===');
    console.log('エンドポイント: https://anemone-salon.com/wp-json/wp/v2/salon');
    
    const response = await fetch('https://anemone-salon.com/wp-json/wp/v2/salon', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('レスポンス受信:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('データ取得成功:', data);
      return {
        data: data,
        success: true
      };
    } else {
      const errorText = await response.text();
      console.error('レスポンスエラー:', errorText);
      return {
        data: null,
        success: false,
        message: `HTTP ${response.status}: ${response.statusText} - ${errorText}`
      };
    }
  } catch (error) {
    console.error('Fetch エラー:', error);
    return {
      data: null,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * データ取得の共通関数（フォールバック機能付き）
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
      try {
        // WordPress REST APIを使用
        if (type === 'salons') {
          const wpPosts = await getWpData<any[]>('salon', params);
          console.log('取得したWordPress投稿データ:', wpPosts);
          
          // データ変換を安全に実行
          try {
            data = wpPosts.map((wpPost, index) => {
              console.log(`変換中: 投稿 ${index + 1}/${wpPosts.length}`, wpPost);
              return convertWpPostToLegacySalon(wpPost);
            }) as T;
          } catch (conversionError) {
            console.error('データ変換エラー:', conversionError);
            throw new Error(`Data conversion failed: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
          }
        } else if (type === 'news') {
          const wpPosts = await getWpData<any[]>('posts', { ...params, categories: 'news' });
          data = wpPosts.map(convertWpPostToLegacyNews) as T;
        } else {
          data = await getWpData<T>(type, params);
        }
      } catch (wpError) {
        console.warn(`WordPress API failed for ${type}, falling back to mock data:`, wpError);
        // WordPress APIが失敗した場合、モックデータにフォールバック
        data = await getMockData<T>(type);
      }
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
  },

  // WordPress REST API専用の関数
  /**
   * WordPress REST APIから直接データを取得（変換なし）
   */
  async getWpPosts(postType: string = 'posts', params: Record<string, any> = {}): Promise<ApiResponse<WpPost[]>> {
    try {
      const data = await getWpData<WpPost[]>(postType, params);
      return {
        data,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * WordPress REST APIからメディアを取得
   */
  async getWpMedia(mediaId: number): Promise<ApiResponse<WpMedia>> {
    try {
      const data = await getWpData<WpMedia>(`media/${mediaId}`);
      return {
        data,
        success: true
      };
    } catch (error) {
      return {
        data: null as unknown as WpMedia,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * WordPress REST APIからカテゴリを取得
   */
  async getWpCategories(): Promise<ApiResponse<WpCategory[]>> {
    try {
      const data = await getWpData<WpCategory[]>('categories');
      return {
        data,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * WordPress REST APIからタグを取得
   */
  async getWpTags(): Promise<ApiResponse<WpTag[]>> {
    try {
      const data = await getWpData<WpTag[]>('tags');
      return {
        data,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * WordPress REST APIの接続テスト
   */
  async testWpConnection(): Promise<ApiResponse<boolean>> {
    try {
      await getWpData('posts', { per_page: 1 });
      return {
        data: true,
        success: true
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  },

  /**
   * データ変換テスト（デバッグ用）
   */
  async testDataConversion(): Promise<ApiResponse<any>> {
    try {
      // WordPress APIから生データを取得
      const rawData = await getWpData<any[]>('salon', { per_page: 1 });
      
      if (rawData.length === 0) {
        return {
          data: { error: 'No salon data found' },
          success: false,
          message: 'No salon data available for conversion test'
        };
      }
      
      // 最初の店舗データを変換
      const originalData = rawData[0];
      const convertedData = convertWpPostToLegacySalon(originalData);
      
      return {
        data: {
          original: originalData,
          converted: convertedData,
          fieldMapping: {
            'salon-address': originalData.acf?.['salon-address'],
            'salon-tel': originalData.acf?.['salon-tel'],
            'salon-access.open': originalData.acf?.['salon-access']?.open,
            'salon-prefecture.label': originalData.acf?.['salon-prefecture']?.label,
            'salon-preorder-url': originalData.acf?.['salon-preorder-url']
          }
        },
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : 'Conversion test failed'
      };
    }
  },

  /**
   * 詳細な接続テスト（デバッグ用）
   */
  async debugWpConnection(): Promise<ApiResponse<any>> {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      config: {
        wpApiUrl: API_CONFIG.wpApiUrl,
        hasAuth: !!(API_CONFIG.wpAuth.username && API_CONFIG.wpAuth.password),
        useMockData: API_CONFIG.useMockData
      },
      tests: []
    };

    // テスト1: 基本的な接続テスト
    try {
      const response = await fetch(`${API_CONFIG.wpApiUrl}/posts?per_page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      debugInfo.tests.push({
        name: 'Basic Connection Test',
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      debugInfo.tests.push({
        name: 'Basic Connection Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // テスト2: 認証付き接続テスト
    if (API_CONFIG.wpAuth.username && API_CONFIG.wpAuth.password) {
      try {
        const credentials = btoa(`${API_CONFIG.wpAuth.username}:${API_CONFIG.wpAuth.password}`);
        const response = await fetch(`${API_CONFIG.wpApiUrl}/posts?per_page=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
          },
          mode: 'cors',
          credentials: 'omit'
        });
        
        debugInfo.tests.push({
          name: 'Authenticated Connection Test',
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error) {
        debugInfo.tests.push({
          name: 'Authenticated Connection Test',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // テスト3: カスタム投稿タイプのテスト
    try {
      const response = await fetch(`${API_CONFIG.wpApiUrl}/salon?per_page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      debugInfo.tests.push({
        name: 'Custom Post Type Test (salon)',
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      debugInfo.tests.push({
        name: 'Custom Post Type Test (salon)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return {
      data: debugInfo,
      success: true
    };
  },

  /**
   * シンプルなfetchテスト（API抽象化レイヤーをバイパス）
   */
  async simpleFetchTest(): Promise<ApiResponse<any[]>> {
    return await simpleFetchTest();
  }
};
