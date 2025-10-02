# タイポグラフィガイド

## 概要

アネモネサロンのウェブサイトにおけるタイポグラフィの設計方針と実装方法について説明します。

## 🎨 フォントファミリー

### メインフォント（ゴシック体）
- **Zen Kaku Gothic New** - メインのゴシック体フォント
- **フォールバック**: Hiragino Sans, ヒラギノ角ゴシック, Yu Gothic, Meiryo, sans-serif
- **用途**: 本文、ナビゲーション、ボタン、UI要素

### セリフフォント（明朝体）
- **Yu Mincho** - メインの明朝体フォント
- **フォールバック**: 游明朝, Hiragino Mincho ProN, MS PMincho, serif
- **用途**: 見出し、タイトル、装飾的なテキスト

### 等幅フォント
- **Monaco, Consolas, Courier New** - コード表示用
- **用途**: コードブロック、技術的な情報

## 📏 フォントサイズ

### サイズスケール
```typescript
hero: '3.5rem'           // ヒーロー見出し
heading-2xl: '2.25rem'   // 大見出し
heading-xl: '1.875rem'   // 中見出し
heading-lg: '1.5rem'     // 小見出し
heading-md: '1.25rem'    // 最小見出し
heading-sm: '1.125rem'   // サブ見出し
body-lg: '1.125rem'      // 大本文
body-base: '1rem'        // 標準本文
body-sm: '0.875rem'      // 小本文
body-xs: '0.75rem'       // 最小本文
```

## ⚖️ フォントウェイト

### ウェイトスケール
```typescript
thin: '100'        // 極細
light: '300'       // 細字
normal: '400'      // 標準
medium: '500'      // 中字
semibold: '600'    // やや太字
bold: '700'        // 太字
extrabold: '800'   // 極太
black: '900'       // 最太
```

## 📐 行間（Line Height）

### 行間スケール
```typescript
tight: '1.1'      // 密
snug: '1.2'       // やや密
normal: '1.5'     // 標準
relaxed: '1.6'    // やや広
loose: '2'        // 広
```

## 🎯 タイポグラフィプリセット

### 使用可能なプリセット

```typescript
// ヒーロー見出し
hero: 'text-hero font-black leading-tight font-serif'

// 大見出し
headingLarge: 'text-heading-2xl font-bold leading-snug font-serif'

// 中見出し
headingMedium: 'text-heading-lg font-semibold leading-normal font-serif'

// 小見出し
headingSmall: 'text-heading-md font-medium leading-normal font-serif'

// 本文（大）
bodyLarge: 'text-body-lg font-normal leading-relaxed font-sans'

// 本文（標準）
bodyBase: 'text-body-base font-normal leading-normal font-sans'

// 本文（小）
bodySmall: 'text-body-sm font-normal leading-normal font-sans'

// キャプション
caption: 'text-body-xs font-normal leading-normal font-sans'

// ボタンテキスト
button: 'text-body-base font-semibold leading-normal font-sans'

// ナビゲーション
navigation: 'text-body-base font-medium leading-normal font-sans'
```

## 💻 実装方法

### 1. 基本的な使用方法

#### HTMLクラスでの使用
```html
<!-- ヒーロー見出し -->
<h1 class="text-hero font-black leading-tight font-serif">
  アネモネサロン
</h1>

<!-- 大見出し -->
<h2 class="text-heading-2xl font-bold leading-snug font-serif">
  全国の店舗
</h2>

<!-- 本文 -->
<p class="text-body-base font-normal leading-normal font-sans">
  お客様一人ひとりに合ったスタイルをご提案いたします。
</p>
```

#### プリセットを使用
```html
<!-- プリセットを使用した例 -->
<h1 class="hero">アネモネサロン</h1>
<h2 class="headingLarge">全国の店舗</h2>
<p class="bodyBase">本文テキスト</p>
```

### 2. TypeScriptでの使用

#### フォントユーティリティの使用
```typescript
import { TYPOGRAPHY_PRESETS, createFontClass } from '../lib/design-system';

// プリセットを使用
const heroClass = TYPOGRAPHY_PRESETS.hero;

// カスタムフォントクラスを生成
const customClass = createFontClass('serif', 'heading-lg', 'bold', 'snug');
```

#### Astroコンポーネントでの使用
```astro
---
import { TYPOGRAPHY_PRESETS } from '../lib/design-system';
---

<h1 class={TYPOGRAPHY_PRESETS.hero}>
  アネモネサロン
</h1>
```

### 3. レスポンシブタイポグラフィ

```html
<!-- レスポンシブフォントサイズ -->
<h1 class="text-2xl md:text-4xl lg:text-6xl font-black font-serif">
  レスポンシブ見出し
</h1>

<!-- レスポンシブ行間 -->
<p class="text-base md:text-lg leading-normal md:leading-relaxed font-sans">
  レスポンシブ本文
</p>
```

## 🎨 デザインガイドライン

### 見出しの階層

1. **H1 (ヒーロー)**: `hero` プリセット
2. **H2 (ページタイトル)**: `headingLarge` プリセット
3. **H3 (セクションタイトル)**: `headingMedium` プリセット
4. **H4 (サブセクション)**: `headingSmall` プリセット

### 本文の使い分け

- **重要度の高い本文**: `bodyLarge` プリセット
- **標準の本文**: `bodyBase` プリセット
- **補足情報**: `bodySmall` プリセット
- **注釈・キャプション**: `caption` プリセット

### フォントの使い分け

- **見出し・タイトル**: セリフフォント（Yu Mincho）
- **本文・UI要素**: ゴシックフォント（Zen Kaku Gothic New）
- **コード・技術情報**: 等幅フォント

## 🔧 カスタマイズ方法

### 新しいプリセットを追加

```typescript
// src/lib/utils/fonts.ts
export const TYPOGRAPHY_PRESETS = {
  // 既存のプリセット...
  
  // 新しいプリセット
  customHeading: `${FONT_SIZES.HEADING_XL} ${FONT_WEIGHTS.EXTRABOLD} ${LINE_HEIGHTS.TIGHT} ${FONT_FAMILIES.SERIF}`,
} as const;
```

### フォントサイズを追加

```typescript
// src/lib/config/theme.ts
fontSize: {
  // 既存のサイズ...
  'custom-xl': '1.75rem',  // 新しいサイズ
}
```

## 📱 アクセシビリティ

### 読みやすさの確保

1. **十分なコントラスト比**: テキストと背景のコントラスト比は4.5:1以上
2. **適切な行間**: 本文は1.5以上の行間を確保
3. **フォントサイズ**: 最小16px（1rem）以上を推奨

### フォーカス表示

```css
/* フォーカス時のアウトライン */
.focus\:outline-none:focus {
  outline: 2px solid #E91E63;
  outline-offset: 2px;
}
```

## 🚀 パフォーマンス最適化

### フォント読み込みの最適化

```html
<!-- プリロードでフォント読み込みを最適化 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&display=swap" rel="stylesheet">
```

### 使用するウェイトのみを読み込み

必要なウェイトのみを指定して、不要なフォントファイルの読み込みを避ける。

## 📋 チェックリスト

### 新しいテキスト要素を追加する場合

- [ ] 適切なプリセットを選択
- [ ] フォントファミリーが用途に合っているか確認
- [ ] フォントサイズが階層に合っているか確認
- [ ] 行間が読みやすさに適しているか確認
- [ ] アクセシビリティ要件を満たしているか確認

### フォントを変更する場合

- [ ] `theme.ts` でフォントファミリーを更新
- [ ] `tailwind.config.js` で設定を同期
- [ ] 既存のプリセットが影響を受けないか確認
- [ ] フォールバックフォントを適切に設定
- [ ] パフォーマンスへの影響を確認

---

**最終更新**: 2024年10月2日  
**バージョン**: 1.0.0  
**対象**: 開発チーム
