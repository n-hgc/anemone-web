// 統一されたデザインシステム
// theme.tsから設定をインポートして使用

import { theme } from '../config/theme';
import { TYPOGRAPHY_PRESETS, FONT_FAMILIES, FONT_SIZES, FONT_WEIGHTS } from '../utils/fonts';

// テーマ設定を再エクスポート
export { theme };

// コンポーネントクラス（テーマ設定を使用）
export const componentClasses = {
  button: {
    primary: `bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
    secondary: `border border-primary-500 text-primary-500 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
    outline: `border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2`
  },
  card: {
    base: `bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow`,
    elevated: `bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow`
  },
  input: {
    base: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`,
    error: `w-full px-3 py-2 border border-error rounded-md focus:outline-none focus:ring-2 focus:ring-error focus:border-error`
  },
  container: {
    base: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`,
    narrow: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`,
    wide: `max-w-full mx-auto px-4 sm:px-6 lg:px-8`
  },
  section: {
    base: `py-16`,
    small: `py-8`,
    large: `py-24`
  }
};

// レスポンシブユーティリティ
export const responsive = {
  grid: {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  },
  text: {
    'heading-2xl': 'text-2xl md:text-4xl lg:text-6xl',
    'heading-xl': 'text-xl md:text-3xl lg:text-4xl',
    'heading-lg': 'text-lg md:text-2xl lg:text-3xl'
  },
  spacing: {
    'section': 'py-8 md:py-16 lg:py-20',
    'container': 'px-4 sm:px-6 lg:px-8'
  }
};

// カラーユーティリティ
export const colorUtils = {
  // 背景色クラスを生成
  getBackgroundClass: (color: string) => `bg-${color}`,
  // テキスト色クラスを生成
  getTextClass: (color: string) => `text-${color}`,
  // ボーダー色クラスを生成
  getBorderClass: (color: string) => `border-${color}`,
  // ホバー色クラスを生成
  getHoverClass: (color: string) => `hover:bg-${color}`
};

// フォントユーティリティを再エクスポート
export { 
  TYPOGRAPHY_PRESETS, 
  FONT_FAMILIES, 
  FONT_SIZES, 
  FONT_WEIGHTS,
  createFontClass,
  getTypographyPreset
} from '../utils/fonts';

// 型定義を再エクスポート
export type { Theme, ColorScale, BackgroundColor } from '../config/theme';
export type { FontFamily, FontSize, FontWeight, TypographyPreset } from '../utils/fonts';