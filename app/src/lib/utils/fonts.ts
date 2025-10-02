// フォント管理ユーティリティ
// 統一されたフォント管理とタイポグラフィのヘルパー関数

import { theme } from '../config/theme';

// フォントファミリーの定数
export const FONT_FAMILIES = {
  SANS: 'font-sans',      // Zen Kaku Gothic New（メイン）
  SERIF: 'font-serif',    // Yu Mincho（セリフ）
  MONO: 'font-mono'       // 等幅フォント
} as const;

// フォントサイズの定数
export const FONT_SIZES = {
  HERO: 'text-hero',
  HEADING_2XL: 'text-heading-2xl',
  HEADING_XL: 'text-heading-xl',
  HEADING_LG: 'text-heading-lg',
  HEADING_MD: 'text-heading-md',
  HEADING_SM: 'text-heading-sm',
  BODY_LG: 'text-body-lg',
  BODY_BASE: 'text-body-base',
  BODY_SM: 'text-body-sm',
  BODY_XS: 'text-body-xs'
} as const;

// フォントウェイトの定数
export const FONT_WEIGHTS = {
  THIN: 'font-thin',
  LIGHT: 'font-light',
  NORMAL: 'font-normal',
  MEDIUM: 'font-medium',
  SEMIBOLD: 'font-semibold',
  BOLD: 'font-bold',
  EXTRABOLD: 'font-extrabold',
  BLACK: 'font-black'
} as const;

// 行間の定数
export const LINE_HEIGHTS = {
  TIGHT: 'leading-tight',
  SNUG: 'leading-snug',
  NORMAL: 'leading-normal',
  RELAXED: 'leading-relaxed',
  LOOSE: 'leading-loose'
} as const;

// タイポグラフィのプリセット
export const TYPOGRAPHY_PRESETS = {
  // ヒーロー見出し
  hero: `${FONT_SIZES.HERO} ${FONT_WEIGHTS.BLACK} ${LINE_HEIGHTS.TIGHT} ${FONT_FAMILIES.SERIF}`,
  
  // 大見出し
  headingLarge: `${FONT_SIZES.HEADING_2XL} ${FONT_WEIGHTS.BOLD} ${LINE_HEIGHTS.SNUG} ${FONT_FAMILIES.SERIF}`,
  
  // 中見出し
  headingMedium: `${FONT_SIZES.HEADING_LG} ${FONT_WEIGHTS.SEMIBOLD} ${LINE_HEIGHTS.NORMAL} ${FONT_FAMILIES.SERIF}`,
  
  // 小見出し
  headingSmall: `${FONT_SIZES.HEADING_MD} ${FONT_WEIGHTS.MEDIUM} ${LINE_HEIGHTS.NORMAL} ${FONT_FAMILIES.SERIF}`,
  
  // 本文（大）
  bodyLarge: `${FONT_SIZES.BODY_LG} ${FONT_WEIGHTS.NORMAL} ${LINE_HEIGHTS.RELAXED} ${FONT_FAMILIES.SANS}`,
  
  // 本文（標準）
  bodyBase: `${FONT_SIZES.BODY_BASE} ${FONT_WEIGHTS.NORMAL} ${LINE_HEIGHTS.NORMAL} ${FONT_FAMILIES.SANS}`,
  
  // 本文（小）
  bodySmall: `${FONT_SIZES.BODY_SM} ${FONT_WEIGHTS.NORMAL} ${LINE_HEIGHTS.NORMAL} ${FONT_FAMILIES.SANS}`,
  
  // キャプション
  caption: `${FONT_SIZES.BODY_XS} ${FONT_WEIGHTS.NORMAL} ${LINE_HEIGHTS.NORMAL} ${FONT_FAMILIES.SANS}`,
  
  // ボタンテキスト
  button: `${FONT_SIZES.BODY_BASE} ${FONT_WEIGHTS.SEMIBOLD} ${LINE_HEIGHTS.NORMAL} ${FONT_FAMILIES.SANS}`,
  
  // ナビゲーション
  navigation: `${FONT_SIZES.BODY_BASE} ${FONT_WEIGHTS.MEDIUM} ${LINE_HEIGHTS.NORMAL} ${FONT_FAMILIES.SANS}`
} as const;

// フォントクラスを生成するヘルパー関数
export const createFontClass = (
  family: keyof typeof FONT_FAMILIES,
  size?: keyof typeof FONT_SIZES,
  weight?: keyof typeof FONT_WEIGHTS,
  lineHeight?: keyof typeof LINE_HEIGHTS
): string => {
  const classes = [FONT_FAMILIES[family]];
  
  if (size) classes.push(FONT_SIZES[size]);
  if (weight) classes.push(FONT_WEIGHTS[weight]);
  if (lineHeight) classes.push(LINE_HEIGHTS[lineHeight]);
  
  return classes.join(' ');
};

// プリセットを使用するヘルパー関数
export const getTypographyPreset = (preset: keyof typeof TYPOGRAPHY_PRESETS): string => {
  return TYPOGRAPHY_PRESETS[preset];
};

// フォントの使用例を生成する関数
export const generateFontExamples = () => {
  return {
    hero: {
      class: TYPOGRAPHY_PRESETS.hero,
      description: 'ヒーローセクションのメインタイトル用'
    },
    heading: {
      class: TYPOGRAPHY_PRESETS.headingLarge,
      description: 'ページの大見出し用'
    },
    body: {
      class: TYPOGRAPHY_PRESETS.bodyBase,
      description: '本文テキスト用'
    },
    button: {
      class: TYPOGRAPHY_PRESETS.button,
      description: 'ボタンテキスト用'
    }
  };
};

// 型定義
export type FontFamily = keyof typeof FONT_FAMILIES;
export type FontSize = keyof typeof FONT_SIZES;
export type FontWeight = keyof typeof FONT_WEIGHTS;
export type LineHeight = keyof typeof LINE_HEIGHTS;
export type TypographyPreset = keyof typeof TYPOGRAPHY_PRESETS;
