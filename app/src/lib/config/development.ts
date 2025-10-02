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
  
  // デザインシステムの設定（theme.tsから統合）
  design: {
    // テーマ設定をインポート
    ...require('./theme').theme,
    
    // 追加の設定（theme.tsで定義されていないもの）
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
