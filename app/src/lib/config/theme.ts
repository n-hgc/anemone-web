// 統一されたテーマ設定
// このファイルが唯一の真実の源（Single Source of Truth）

export const theme = {
  colors: {
    // ブランドカラー
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#E91E63', // メインカラー
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843'
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#9C27B0', // セカンダリカラー
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    accent: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#FF4081', // アクセントカラー
      600: '#ec4899',
      700: '#db2777',
      800: '#be185d',
      900: '#9d174d'
    },
    // 背景色
    background: {
      beige: '#FAF4E8', // サイト全体の背景色
      white: '#ffffff',
      gray: {
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
    // 状態カラー
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  },
  
  // タイポグラフィ
  typography: {
    fontFamily: {
      // メインフォント（ゴシック体）
      sans: ['Zen Kaku Gothic New', 'Hiragino Sans', 'ヒラギノ角ゴシック', 'Yu Gothic', 'Meiryo', 'sans-serif'],
      // セリフフォント（明朝体）
      serif: ['Yu Mincho', '游明朝', 'Hiragino Mincho ProN', 'MS PMincho', 'serif'],
      // 等幅フォント
      mono: ['Monaco', 'Consolas', 'Courier New', 'monospace']
    },
    fontSize: {
      hero: '3.5rem',
      'heading-2xl': '2.25rem',
      'heading-xl': '1.875rem',
      'heading-lg': '1.5rem',
      'heading-md': '1.25rem',
      'heading-sm': '1.125rem',
      'body-lg': '1.125rem',
      'body-base': '1rem',
      'body-sm': '0.875rem',
      'body-xs': '0.75rem'
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    lineHeight: {
      tight: '1.1',
      snug: '1.2',
      normal: '1.5',
      relaxed: '1.6',
      loose: '2'
    }
  },
  
  // スペーシング
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
    '4xl': '8rem'
  },
  
  // ブレークポイント
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // シャドウ
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  },
  
  // ボーダー半径
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  }
} as const;

// 型定義
export type Theme = typeof theme;
export type ColorScale = keyof typeof theme.colors.primary;
export type BackgroundColor = keyof typeof theme.colors.background;
