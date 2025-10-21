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

// 環境変数解決（import.meta.env を優先し、なければ process.env）
function getEnv(key: string): string | undefined {
  let viteEnv: any = undefined;
  try {
    // Astro/Vite 環境では import.meta.env が存在
    viteEnv = (import.meta as any).env;
  } catch {
    // 何もしない（SSRやビルド時に未定義の可能性）
  }
  const fromVite = viteEnv && Object.prototype.hasOwnProperty.call(viteEnv, key) ? viteEnv[key] : undefined;
  // Node 環境の process.env もフォールバックとして参照
  const fromProcess = (typeof process !== 'undefined' && process.env) ? (process.env as any)[key] : undefined;
  return (fromVite !== undefined ? fromVite : fromProcess);
}

// データソースの設定
const API_CONFIG = {
  // 開発環境ではモックデータを使用（WP_API_URLが未設定なら）
  useMockData: (getEnv('NODE_ENV') === 'development') && !getEnv('WP_API_URL'),
  // WordPress REST APIのURL
  wpApiUrl: getEnv('WP_API_URL') || 'https://anemone-salon.com/wp-json/wp/v2',
  // キャッシュ設定
  cacheTimeout: 5 * 60 * 1000, // 5分
  // WordPress 5.8認証設定（Basic認証のみ）
  wpAuth: {
    username: getEnv('WP_BASIC_AUTH_USERNAME'),
    password: getEnv('WP_BASIC_AUTH_PASSWORD')
  }
};

// NEWSデータソース切替（env優先）
function isUseMockNews(): boolean {
  const ds = (getEnv('NEWS_DATA_SOURCE') || '').toLowerCase();
  if (ds === 'mock') return true;
  if (ds === 'wp') return false;
  // 未設定時は既存の判定に準拠
  return API_CONFIG.useMockData;
}

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
  const base = String(API_CONFIG.wpApiUrl || '').replace(/\/+$/, '');
  const ep = String(endpoint || '').replace(/^\/+/, '');
  const url = new URL(`${base}/${ep}`);
  
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
  console.log('環境変数(resolve):', {
    NEWS_DATA_SOURCE: getEnv('NEWS_DATA_SOURCE'),
    WP_API_URL: getEnv('WP_API_URL'),
    NODE_ENV: getEnv('NODE_ENV'),
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
  // 後方互換用の簡易変換（未使用）
  return {
    id: wpPost.id,
    title: wpPost.title?.rendered ?? '',
    content: wpPost.content?.rendered ?? '',
    excerpt: wpPost.excerpt?.rendered ?? '',
    date: wpPost.date_gmt ?? wpPost.date,
    categories: [],
    tags: [],
    featured_image: undefined,
    slug: wpPost.slug ?? String(wpPost.id)
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
    // 既存の単純配列版（後方互換）。NEWS_DATA_SOURCE=wp の場合は blog から取得
    if (!isUseMockNews()) {
      const list = await this.getNewsList({ per_page: 10, page: 1 });
      return {
        data: list.success ? list.data.items : [],
        success: list.success,
        message: list.message
      };
    }
    return fetchData('news', filters);
  },
  
  /**
   * 特定のニュースを取得
   */
  async getNewsItem(id: number): Promise<ApiResponse<any>> {
    if (!isUseMockNews()) {
      try {
        const item = await getBlogItem(id);
        return { data: item, success: true };
      } catch (e) {
        return { data: null, success: false, message: e instanceof Error ? e.message : 'Unknown error' };
      }
    }
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
  },

  /**
   * NEWS: WordPress blog から一覧取得（ページネーション情報付き）
   */
  async getNewsList(params: { page?: number; per_page?: number; news_type?: number } = {}): Promise<ApiResponse<{ items: LegacyNews[]; total: number; totalPages: number }>> {
    try {
      // デバッグログ追加
      console.log('=== getNewsList デバッグ情報 ===');
      console.log('環境変数 WP_API_URL:', getEnv('WP_API_URL'));
      console.log('環境変数 NEWS_DATA_SOURCE:', getEnv('NEWS_DATA_SOURCE'));
      console.log('環境変数 NODE_ENV:', getEnv('NODE_ENV'));
      console.log('isUseMockNews():', isUseMockNews());
      console.log('API_CONFIG:', API_CONFIG);
      console.log('params:', params);
      
      if (isUseMockNews()) {
        console.log('Using mock news data');
        const all = await getMockData<LegacyNews[]>('news');
        const page = params.page ?? 1;
        const perPage = params.per_page ?? 4;
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const items = all.slice(start, end);
        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        console.log('Mock data result:', { items: items.length, total, totalPages });
        return { data: { items, total, totalPages }, success: true };
      }
      
      console.log('Fetching news from WordPress API');
      const result = await fetchBlogList(params);
      console.log('WordPress API result:', result);
      return { data: result, success: true };
    } catch (error) {
      console.error('Error fetching news:', error);
      return { data: { items: [], total: 0, totalPages: 0 }, success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * NEWS: news_type のスラッグからIDを解決
   */
  async resolveNewsTypeId(slug: string): Promise<number | null> {
    try {
      if (isUseMockNews()) return null; // モックではカテゴリ未使用
      return await resolveNewsTypeIdInternal(slug);
    } catch (e) {
      return null;
    }
  },

  /**
   * NEWS: 単一記事を取得
   */
  async getBlogItem(id: number): Promise<LegacyNews | null> {
    try {
      if (isUseMockNews()) {
        const all = await getMockData<LegacyNews[]>('news');
        return all.find(item => item.id === id) || null;
      }
      const { data } = await fetchWithHeaders(`blog/${id}`, { _embed: 1 });
      return mapBlogToNews(data as WpBlog);
    } catch (e) {
      return null;
    }
  }
};

// ========== 内部ユーティリティ（NEWS用） ==========

function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function toPlainText(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

type WpBlog = {
  id: number;
  date_gmt: string;
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
  featured_media: number;
  news_type_terms?: { slug: string; name: string }[];
  _embedded?: { 'wp:featuredmedia'?: Array<{ source_url: string; alt_text?: string }>; };
};

function mapBlogToNews(p: WpBlog): LegacyNews {
  const media = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const categories = (p.news_type_terms ?? []).map(t => t.name);
  
  // コンテンツのテキスト部分を<p>タグで囲む処理
  let content = p.content?.rendered ?? '';
  if (content) {
    // 既存の<p>タグがある場合はそのまま使用
    if (!content.includes('<p>')) {
      // <p>タグがない場合のみ、テキストを行ごとに分割して<p>タグで囲む
      const lines = content.split('\n').filter(line => line.trim() !== '');
      content = lines.map(line => `<p>${line.trim()}</p>`).join('\n');
    }
  }
  
  return {
    id: p.id,
    title: decodeHtml(p.title?.rendered ?? ''),
    date: p.date_gmt,
    categories: categories.length > 0 ? categories : ['INFORMATION'],
    featured_image: media || undefined,
    excerpt: toPlainText(p.content?.rendered ?? '').slice(0, 120),
    content: content, // <p>タグで囲まれたコンテンツ
    tags: [],
    slug: p.slug,
  };
}

async function fetchWithHeaders(endpoint: string, params: Record<string, any> = {}): Promise<{ data: any; headers: Headers }> {
  const url = new URL(`${API_CONFIG.wpApiUrl}/${endpoint}`);
  console.log("url"+url);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
  });
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_CONFIG.wpAuth.username && API_CONFIG.wpAuth.password) {
    const credentials = btoa(`${API_CONFIG.wpAuth.username}:${API_CONFIG.wpAuth.password}`);
    headers['Authorization'] = `Basic ${credentials}`;
  }
  const res = await fetch(url.toString(), { method: 'GET', headers, mode: 'cors', credentials: 'omit' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const json = await res.json();
  return { data: json, headers: res.headers };
}

async function fetchBlogList(params: { page?: number; per_page?: number; news_type?: number } = {}): Promise<{ items: LegacyNews[]; total: number; totalPages: number }> {
  console.log('=== fetchBlogList デバッグ情報 ===');
  console.log('params:', params);
  console.log('API_CONFIG.wpApiUrl:', API_CONFIG.wpApiUrl);
  
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 4;
  const query: Record<string, any> = { _embed: 1, page, per_page, status: 'publish', order: 'desc', orderby: 'date' };
  if (params.news_type) query['news_type'] = params.news_type;
  
  console.log('WordPress API query:', query);
  
  const { data, headers } = await fetchWithHeaders('blog', query);
  
  console.log('WordPress API response data length:', Array.isArray(data) ? data.length : 'not array');
  console.log('WordPress API headers:', {
    'X-WP-Total': headers.get('X-WP-Total'),
    'x-wp-total': headers.get('x-wp-total'),
    'X-WP-TotalPages': headers.get('X-WP-TotalPages'),
    'x-wp-totalpages': headers.get('x-wp-totalpages')
  });
  
  const items = (data as WpBlog[]).map(mapBlogToNews);
  const total = Number(headers.get('X-WP-Total') || headers.get('x-wp-total') || items.length);
  const totalPages = Number(headers.get('X-WP-TotalPages') || headers.get('x-wp-totalpages') || 1);
  
  console.log('Processed items:', { items: items.length, total, totalPages });
  
  return { items, total, totalPages };
}

const newsTypeCache = new Map<string, number>();
async function resolveNewsTypeIdInternal(slug: string): Promise<number | null> {
  if (newsTypeCache.has(slug)) return newsTypeCache.get(slug)!;
  const list = await getWpData<any[]>('news_type', { slug });
  if (Array.isArray(list) && list.length > 0 && typeof list[0].id === 'number') {
    newsTypeCache.set(slug, list[0].id);
    return list[0].id;
  }
  return null;
}
