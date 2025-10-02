// 開発環境用の設定
export const developmentConfig = {
  // データソースの設定
  dataSource: {
    // 開発時はモックデータを使用
    useMockData: true,
    // WordPress REST APIのURL（将来設定）
    wpApiUrl: process.env.WP_API_URL || 'https://wp.example.com/wp-json/wp/v2',
    // キャッシュの有効/無効
    enableCache: true,
    // キャッシュの有効期限（ミリ秒）
    cacheTimeout: 5 * 60 * 1000, // 5分
  },
  
  // デザインシステムの設定
  design: {
    // カラーパレット
    colors: {
      primary: '#E91E63',
      secondary: '#9C27B0',
      accent: '#FF4081',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121'
      }
    },
    
    // タイポグラフィ
    typography: {
      hero: {
        fontSize: '3.5rem',
        fontWeight: '900',
        lineHeight: '1.1',
        letterSpacing: '-0.025em'
      },
      heading: {
        fontSize: '2.25rem',
        fontWeight: '800',
        lineHeight: '1.2'
      },
      subheading: {
        fontSize: '1.5rem',
        fontWeight: '700',
        lineHeight: '1.3'
      },
      body: {
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.6'
      }
    },
    
    // スペーシング
    spacing: {
      section: '5rem',
      container: '1.5rem',
      card: '1.5rem'
    }
  },
  
  // サイト設定
  site: {
    name: 'アネモネサロン',
    url: process.env.SITE_URL || 'https://anemone-salon.com',
    description: 'アネモネサロンは全国展開する美容室・ヘアサロンです。お客様一人ひとりに合ったスタイルをご提案いたします。'
  },
  
  // 機能の有効/無効
  features: {
    // 検索機能
    search: true,
    // 地域フィルター
    locationFilter: true,
    // お気に入り機能
    favorites: false,
    // 予約機能
    reservation: true,
    // ニュース機能
    news: true,
    // 採用情報
    recruitment: true
  },
  
  // デバッグ設定
  debug: {
    // ログレベル
    logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
    // API呼び出しのログ出力
    logApiCalls: true,
    // パフォーマンス測定
    measurePerformance: true
  }
};

// 本番環境用の設定（将来的に使用）
export const productionConfig = {
  ...developmentConfig,
  dataSource: {
    ...developmentConfig.dataSource,
    useMockData: false, // 本番ではWordPress REST APIを使用
    enableCache: true,
    cacheTimeout: 15 * 60 * 1000, // 15分
  },
  debug: {
    ...developmentConfig.debug,
    logLevel: 'error',
    logApiCalls: false,
    measurePerformance: false
  }
};

// 現在の環境に応じた設定を取得
export const config = process.env.NODE_ENV === 'production' 
  ? productionConfig 
  : developmentConfig;
