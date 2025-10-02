# Anemone Salon - Headless Web Implementation

アネモネサロンのヘッドレスWebサイト実装プロジェクトです。WordPress 5.8.11をHeadless CMSとして使用し、Astro + Cloudflare Pagesで構築されています。

## 🎨 Figma MCP統合

このプロジェクトはFigma MCP（Model Context Protocol）を使用して、Figmaのデザインデータを直接コードに変換し、デザインの精度を向上させています。

- **Figma MCPサーバー**: `http://127.0.0.1:3845/mcp`
- **Figmaファイル**: [anemone-v1](https://www.figma.com/design/kRVC29kld4299v1Gyby1Hg/anemone-v1?t=2Ztg5fZZcsdBZleC-0)

## プロジェクト構成

```
anemone-web/
├── app/                    # Astroアプリケーション（メインサイト）
│   ├── src/
│   │   ├── components/     # UIコンポーネント
│   │   ├── layouts/        # レイアウトコンポーネント
│   │   ├── pages/          # ページ（ルーティング）
│   │   ├── lib/            # ユーティリティ・ライブラリ
│   │   ├── types/          # TypeScript型定義
│   │   └── data/           # モックデータ
│   └── package.json
├── packages/
│   ├── ui/                 # デザインシステム（将来実装）
│   └── workers/            # Cloudflare Workers（将来実装）
├── scripts/                # ビルド・デプロイスクリプト（将来実装）
├── infra/                  # インフラ設定（将来実装）
└── docs/                   # 開発ドキュメント
```

## 技術スタック

- **Frontend**: Astro 4.x + TypeScript
- **Styling**: Tailwind CSS 4.x
- **CMS**: WordPress 5.8.11 (Headless)
- **Hosting**: Cloudflare Pages
- **Search**: Fuse.js (クライアントサイド検索)

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd anemone-web

# 依存関係をインストール
cd app
npm install
```

### 開発サーバーの起動

```bash
cd app
npm run dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:4321` にアクセスしてください。

### ビルド

```bash
cd app
npm run build
```

## ページ構成

- `/` - トップページ（店舗一覧 + 地域フィルタ + 最新ニュース）
- `/salon/[id]` - 店舗詳細ページ（SSG）
- `/news/` - ニュース一覧ページ
- `/news/[id]` - ニュース詳細ページ（SSG）
- `/recruit/` - 採用情報ページ

## 主要機能

### 1. 店舗検索・フィルタリング
- 都道府県・市区町村による地域フィルタ
- クライアントサイド検索（Fuse.js使用）
- 店舗詳細情報の表示

### 2. ニュース・ブログ
- ニュース一覧・詳細表示
- カテゴリ・タグによる分類
- 関連ニュースの表示

### 3. 採用情報
- 職種別の求人情報
- 福利厚生の紹介
- 外部ATSへの遷移

### 4. SEO対応
- JSON-LD構造化データ
- Open Graph / Twitter Card
- メタタグ最適化

## コンポーネント

### 基本コンポーネント
- `SalonCard` - 店舗カード
- `NewsCard` - ニュースカード
- `LocatorFilters` - 地域フィルター

### レイアウト
- `Layout` - 基本レイアウト（ヘッダー・フッター）

## データ構造

### 店舗データ（Salon）
```typescript
interface Salon {
  id: number;
  name: string;
  address: string;
  tel: string;
  hours: string;
  payment: string;
  facilities: string[];
  geo: { lat: number; lng: number };
  prefecture: string;
  city: string;
  photos: string[];
  reservation_url: string;
  gmb_place_id?: string;
}
```

### ニュースデータ（News）
```typescript
interface News {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  categories: string[];
  tags: string[];
  featured_image?: string;
  slug: string;
}
```

## 開発ガイドライン

### コーディング規約
- TypeScriptを使用
- コンポーネントはAstro形式で作成
- スタイリングはTailwind CSSを使用
- 型定義は`src/types/`に配置

### コンポーネント作成
1. `src/components/`に新しいコンポーネントファイルを作成
2. 必要な型定義を`src/types/`に追加
3. コンポーネントのPropsインターフェースを定義
4. スタイリングはTailwind CSSクラスを使用

### ページ作成
1. `src/pages/`に新しいページファイルを作成
2. 必要に応じて`Layout`コンポーネントを使用
3. SEO用のメタタグとJSON-LDを設定

## 今後の実装予定

### Phase 1: 基本機能（現在）
- [x] 静的サイトの構築
- [x] モックデータでの動作確認
- [x] 基本的なUIコンポーネント

### Phase 2: WordPress連携
- [ ] WordPress REST API連携
- [ ] Cloudflare Workers実装
- [ ] 動的データ取得

### Phase 3: 高度な機能
- [ ] 検索機能の強化
- [ ] 画像最適化
- [ ] パフォーマンス最適化

## デプロイ

### Cloudflare Pages
1. Cloudflare Pagesにプロジェクトを接続
2. ビルドコマンド: `npm run build`
3. ビルド出力ディレクトリ: `dist`

### 環境変数
```bash
# .env.local
WP_ORIGIN=https://wp-origin.example.com
WP_BASIC_B64=xxxxxx
PUBLIC_SITE_ORIGINS=https://anemone-salon.com
```

## ライセンス

このプロジェクトは内部使用のためのものです。

## 貢献

プロジェクトへの貢献については、開発チームまでお問い合わせください。

## サポート

技術的な質問や問題については、開発チームまでご連絡ください。
