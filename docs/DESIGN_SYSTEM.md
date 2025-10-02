# デザインシステム設計方針

## 概要

アネモネサロンのウェブサイトにおけるデザインシステムの設計方針と実装方法について説明します。

## 🎨 カラーパレット

### 基本方針
- **Single Source of Truth**: すべてのカラー定義は `src/lib/config/theme.ts` で一元管理
- **統一性**: サイト全体で一貫したカラーパレットを使用
- **アクセシビリティ**: 十分なコントラスト比を確保

### カラー定義

#### ブランドカラー
```typescript
primary: {
  50: '#fdf2f8',   // 最も薄いピンク
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#E91E63',  // メインカラー
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843'   // 最も濃いピンク
}
```

#### セカンダリカラー
```typescript
secondary: {
  50: '#faf5ff',   // 最も薄いパープル
  500: '#9C27B0',  // メインセカンダリ
  900: '#581c87'   // 最も濃いパープル
}
```

#### 背景色
```typescript
background: {
  beige: '#FAF4E8',  // サイト全体の背景色
  white: '#ffffff',  // カード・コンテンツ背景
  gray: { /* グレースケール */ }
}
```

## 🏗️ アーキテクチャ設計

### 設定ファイル構造

```
src/lib/config/
├── theme.ts           # メインテーマ設定（Single Source of Truth）
├── development.ts     # 開発環境設定（theme.tsを拡張）
└── production.ts      # 本番環境設定（将来実装）

src/lib/design-system/
└── index.ts          # デザインシステム統合（theme.tsを使用）

tailwind.config.js    # Tailwind設定（theme.tsから値を取得）
```

### 設計原則

1. **一元管理**: すべてのデザイン設定は `theme.ts` で管理
2. **型安全性**: TypeScriptで型定義を提供
3. **拡張性**: 新しいカラーや設定を簡単に追加可能
4. **保守性**: 一箇所の変更で全体に反映

## 🎯 実装方法

### カラーの使用

#### HTMLクラスでの使用
```html
<!-- 背景色 -->
<div class="bg-beige">サイト全体の背景</div>
<div class="bg-primary-500">メインカラー</div>

<!-- テキスト色 -->
<p class="text-primary-600">メインカラーのテキスト</p>

<!-- ボーダー色 -->
<div class="border-primary-200">ボーダー</div>
```

#### 直接CSSでの使用（確実性重視）
```html
<body class="bg-beige" style="background-color: #FAF4E8;">
```

### 設定の変更方法

#### カラーの変更
```typescript
// src/lib/config/theme.ts で変更
background: {
  beige: '#新しい色コード', // ここを変更するだけで全体に反映
}
```

#### 新しいカラーの追加
```typescript
// theme.ts に追加
colors: {
  // 既存のカラー...
  newColor: '#カラーコード',
}
```

## 📐 レイアウト設計

### 背景色の適用方針

1. **サイト全体**: `<body>` タグでベージュ背景を適用
2. **セクション**: 個別の背景色設定は削除し、統一感を保持
3. **カード・コンテンツ**: 白背景でベージュ背景に映えるデザイン

### セクション設計

```html
<!-- ヒーローセクション -->
<section class="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700">
  <!-- グラデーション背景を維持 -->
</section>

<!-- 通常セクション -->
<section class="py-24">
  <!-- 個別背景色なし、サイト全体のベージュ背景を使用 -->
</section>
```

## 🔧 技術実装

### Tailwind CSS v4対応

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // theme.tsから直接値をコピーして定義
        beige: '#FAF4E8',
        primary: { /* カラースケール */ },
        // ...
      }
    }
  }
};
```

### Astro統合

```javascript
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
});
```

## 📋 チェックリスト

### 新しいカラーを追加する場合

- [ ] `src/lib/config/theme.ts` にカラーを追加
- [ ] `tailwind.config.js` にカラーを追加
- [ ] 必要に応じて `src/lib/design-system/index.ts` を更新
- [ ] 開発サーバーを再起動
- [ ] ブラウザで表示を確認

### デザインを変更する場合

- [ ] `theme.ts` で値を変更
- [ ] 関連するファイルを更新
- [ ] 一貫性を確認
- [ ] アクセシビリティを確認

## 🎨 デザインガイドライン

### カラー使用の指針

1. **メインカラー（Primary）**: ボタン、リンク、アクセント要素
2. **セカンダリカラー（Secondary）**: 補助的な装飾要素
3. **背景色（Beige）**: サイト全体の統一感を演出
4. **白背景**: コンテンツカード、読みやすさの確保

### コントラスト比

- テキストと背景のコントラスト比は WCAG AA 基準（4.5:1以上）を満たす
- 重要な要素は WCAG AAA 基準（7:1以上）を推奨

## 📚 参考資料

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Astro Documentation](https://docs.astro.build/)

---

**最終更新**: 2024年10月2日  
**バージョン**: 1.0.0  
**担当者**: 開発チーム
