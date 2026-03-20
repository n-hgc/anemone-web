# ⚡ Astro実装仕様

## 🎯 対象読者
- Astro開発者
- フロントエンド開発者

## 📋 目次
1. [基本構成](#基本構成)
2. [Layout.astroの設定](#layoutastroの設定)
3. [コンポーネント実装](#コンポーネント実装)
4. [CSS読み込み方法](#css読み込み方法)
5. [パフォーマンス最適化](#パフォーマンス最適化)

---

## 🏗️ 基本構成

### ファイル構造
```
app/
├── src/
│   ├── layouts/
│   │   └── Layout.astro        # ベースレイアウト
│   ├── pages/
│   │   └── index.astro         # ページコンポーネント
│   ├── components/
│   │   └── Component.astro     # 再利用可能コンポーネント
│   └── styles/
│       └── global.css          # グローバルCSS
```

### 依存関係
```json
{
  "dependencies": {
    "astro": "^5.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## 🎨 Layout.astroの設定

### 基本テンプレート
```astro
---
export interface Props {
  title: string;
  description: string;
  image?: string;
  jsonLd?: string;
}

const { title, description, image, jsonLd } = Astro.props;
---

<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    
    <!-- グローバルCSSの読み込み（必須） -->
    <link rel="stylesheet" href="/src/styles/global.css">
    
    <!-- フォントはglobal.cssの@font-faceで読み込み (ShinRetroMaruGothic) -->

    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 重要なポイント
- **CSS読み込み**: `<link rel="stylesheet" href="/src/styles/global.css">`は必須
- **フォント最適化**: `preconnect`でパフォーマンス向上
- **メタデータ**: SEO対応のメタタグを設定

---

## 🧩 コンポーネント実装

### ページコンポーネント
```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="ページタイトル" description="ページの説明">
  <div class="min-h-screen bg-beige p-8">
    <h1 class="text-h2-pc text-black mb-8">メインタイトル</h1>
    <p class="text-p-pc text-black">本文テキスト</p>
  </div>
</Layout>
```

### 再利用可能コンポーネント
```astro
---
export interface Props {
  title: string;
  content: string;
  variant?: 'primary' | 'secondary';
}

const { title, content, variant = 'primary' } = Astro.props;
---

<div class={`p-4 rounded-lg ${variant === 'primary' ? 'bg-brown text-white' : 'bg-beige text-black'}`}>
  <h3 class="text-h3-pc mb-2">{title}</h3>
  <p class="text-p-pc">{content}</p>
</div>
```

---

## 🎨 CSS読み込み方法

### グローバルCSS
```astro
<!-- Layout.astro -->
<link rel="stylesheet" href="/src/styles/global.css">
```

### コンポーネント固有CSS
```astro
---
// Component.astro
---

<div class="component-wrapper">
  <!-- コンテンツ -->
</div>

<style>
  .component-wrapper {
    /* コンポーネント固有のスタイル */
  }
</style>
```

### フォント
ローカルフォント (ShinRetroMaruGothic) を `public/fonts/` に配置し、`global.css` の `@font-face` で読み込み。

---

## ⚡ パフォーマンス最適化

### フォント最適化
ローカルフォントファイルを使用し、`font-display: swap` で読み込み遅延を最小化。

### CSS最適化
- **不要なスタイルの削除**: 使用されていないCSSクラスを削除
- **CSS変数の活用**: 重複する値を変数化
- **メディアクエリの最適化**: 必要なブレークポイントのみ定義

---

## 🚨 よくある問題

### CSSが読み込まれない
**原因**: グローバルCSSの読み込み設定が不足
**解決策**: `Layout.astro`に`<link rel="stylesheet" href="/src/styles/global.css">`を追加

### フォントが適用されない
**原因**: フォントの読み込み順序やCSSの優先度
**解決策**: `!important`を使用し、フォント読み込みを最適化

### スタイルが競合する
**原因**: コンポーネントのスコープ付きCSSとグローバルCSSの競合
**解決策**: グローバルCSSで`!important`を使用

---

## 📚 参考資料

### 公式ドキュメント
- [Astro公式ドキュメント](https://docs.astro.build/)
- [Astro + Tailwind CSS統合](https://docs.astro.build/en/guides/integrations-guide/tailwind/)

### ベストプラクティス
- [Astroパフォーマンス最適化](https://docs.astro.build/en/guides/performance/)
- [Astro SEO最適化](https://docs.astro.build/en/guides/integrations-guide/tailwind/)

---

**最終更新日: 2024年12月19日**

---

## データ連携（拡張）：ヘアスタイルJSON

- 生成: `node scripts/generate-hairstyles-json.js`（ビルド前に自動実行）
- 配信: 静的ファイル `/data/hairstyles.index.json`（`app/public/data/hairstyles.index.json` をそのまま配信）
- スキーマ（フラット配列）:
```json
[
  { "id": 9055, "hairType": "medium", "imageUrl": "https://...jpg", "alt": "..." }
]
```
- 取得元: `GET https://anemone-salon.com/wp-json/wp/v2/pages?slug=hairstyle` の `acf.hairstyles` を走査し、`/wp-json/wp/v2/media/{id}` で `source_url`/`alt_text` を解決
- フロント: `app/src/pages/index.astro` で `fetch('/data/hairstyles.index.json')` してタブでフィルタ（ALL/LONG/MEDIUM/SHORT/MENS）
