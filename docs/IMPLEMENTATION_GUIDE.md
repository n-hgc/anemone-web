# 実装ガイド - デザインシステム

## 概要

アネモネサロンのデザインシステム実装における具体的な手順とベストプラクティスを説明します。

## 🚀 セットアップ手順

### 1. 環境準備

```bash
# 依存関係のインストール
cd app
npm install

# 開発サーバーの起動
npm run dev
```

### 2. 設定ファイルの確認

```bash
# 主要な設定ファイル
app/src/lib/config/theme.ts      # メインテーマ設定
app/tailwind.config.js           # Tailwind設定
app/astro.config.mjs             # Astro設定
```

## 🎨 カラー管理の実装

### 現在の実装状況

#### 背景色の適用
```html
<!-- Layout.astro -->
<body class="bg-beige" style="background-color: #FAF4E8;">
```

**実装理由**: 
- Tailwindクラス（`bg-beige`）と直接CSS（`style`属性）の両方を使用
- 確実性を重視した実装

#### セクション設計
```html
<!-- index.astro の各セクション -->
<section class="py-24">  <!-- 個別背景色なし -->
  <div class="bg-white rounded-lg">  <!-- カードは白背景 -->
    <!-- コンテンツ -->
  </div>
</section>
```

## 🔧 技術的な実装詳細

### 1. テーマ設定の構造

```typescript
// src/lib/config/theme.ts
export const theme = {
  colors: {
    primary: { 50: '#fdf2f8', ..., 900: '#831843' },
    secondary: { 50: '#faf5ff', ..., 900: '#581c87' },
    background: { beige: '#FAF4E8', white: '#ffffff' },
    beige: '#FAF4E8',  // 直接的なアクセス用
    // ...
  },
  // その他の設定...
} as const;
```

### 2. Tailwind設定の統合

```javascript
// tailwind.config.js
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        beige: '#FAF4E8',
        primary: { /* カラースケール */ },
        // theme.tsから直接値をコピー
      }
    }
  }
};
```

### 3. 型安全性の確保

```typescript
// 型定義
export type Theme = typeof theme;
export type ColorScale = keyof typeof theme.colors.primary;
export type BackgroundColor = keyof typeof theme.colors.background;
```

## 📝 よくある作業とその手順

### 新しいカラーを追加する

1. **theme.ts に追加**
```typescript
colors: {
  // 既存のカラー...
  newColor: '#カラーコード',
  newColorScale: {
    50: '#薄い色',
    500: '#メイン色',
    900: '#濃い色'
  }
}
```

2. **tailwind.config.js に追加**
```javascript
colors: {
  // 既存のカラー...
  newColor: '#カラーコード',
  newColorScale: { /* スケール */ }
}
```

3. **開発サーバーを再起動**
```bash
# 現在のサーバーを停止
pkill -f "npm run dev"

# 再起動
npm run dev
```

### 既存のカラーを変更する

1. **theme.ts で変更**
```typescript
background: {
  beige: '#新しい色コード',  // ここを変更
}
```

2. **tailwind.config.js で同期**
```javascript
colors: {
  beige: '#新しい色コード',  // 同じ値に更新
}
```

3. **Layout.astro の直接CSSも更新**
```html
<body class="bg-beige" style="background-color: #新しい色コード;">
```

### セクションの背景色を変更する

```html
<!-- 個別セクションに背景色を追加 -->
<section class="py-24 bg-gray-50">  <!-- グレー背景を追加 -->
  <!-- コンテンツ -->
</section>

<!-- または、カスタム背景色 -->
<section class="py-24" style="background-color: #f0f0f0;">
  <!-- コンテンツ -->
</section>
```

## 🐛 トラブルシューティング

### 背景色が反映されない場合

1. **ブラウザキャッシュをクリア**
   - Ctrl+F5 (Windows) または Cmd+Shift+R (Mac)

2. **開発サーバーを再起動**
   ```bash
   pkill -f "npm run dev"
   npm run dev
   ```

3. **Tailwind設定を確認**
   - `tailwind.config.js` の構文エラーがないか
   - カラー定義が正しいか

4. **直接CSSで確認**
   ```html
   <body style="background-color: #FAF4E8;">
   ```

### Tailwindクラスが認識されない場合

1. **content設定を確認**
   ```javascript
   content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"]
   ```

2. **ファイル拡張子を確認**
   - 使用しているファイル形式がcontentに含まれているか

3. **ESモジュール形式を確認**
   ```javascript
   // 正しい形式
   export default { /* 設定 */ }
   
   // 間違った形式
   module.exports = { /* 設定 */ }
   ```

## 📊 パフォーマンス考慮事項

### CSS最適化

1. **使用されていないクラスの削除**
   - TailwindのPurgeCSSが自動で処理

2. **直接CSSの最小化**
   - 必要な場合のみ `style` 属性を使用

3. **カラー定義の最適化**
   - 必要なカラーのみを定義

### 開発効率

1. **型安全性の活用**
   - TypeScriptでカラー名の自動補完

2. **一元管理の徹底**
   - `theme.ts` のみを編集

3. **ドキュメントの更新**
   - 変更時は関連ドキュメントも更新

## 🔄 今後の改善案

### 短期改善

1. **自動化スクリプトの作成**
   - `theme.ts` から `tailwind.config.js` への自動同期

2. **カラーパレットの拡張**
   - より多くのカラーバリエーション

3. **コンポーネントライブラリの構築**
   - 再利用可能なUIコンポーネント

### 長期改善

1. **デザイントークンの自動生成**
   - Figmaからの自動同期

2. **ダークモード対応**
   - テーマ切り替え機能

3. **アクセシビリティの向上**
   - 自動コントラスト比チェック

---

**最終更新**: 2024年10月2日  
**バージョン**: 1.0.0  
**対象**: 開発チーム
