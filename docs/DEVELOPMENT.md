# 開発ドキュメント

## プロジェクト概要

Anemone SalonのヘッドレスWebサイト実装プロジェクトです。WordPress 5.8.11をHeadless CMSとして使用し、Astro + Cloudflare Pagesで構築されています。

## アーキテクチャ

### フロントエンド
- **Astro 4.x**: 静的サイトジェネレーター
- **TypeScript**: 型安全性の確保
- **Tailwind CSS 4.x**: ユーティリティファーストCSS
- **Fuse.js**: クライアントサイド検索

### バックエンド（将来実装）
- **WordPress 5.8.11**: Headless CMS
- **Cloudflare Workers**: APIプロキシ・キャッシュ
- **Cloudflare Pages**: 静的ホスティング

## ディレクトリ構造

```
app/
├── src/
│   ├── components/         # UIコンポーネント
│   │   ├── SalonCard.astro
│   │   ├── NewsCard.astro
│   │   └── LocatorFilters.astro
│   ├── layouts/            # レイアウトコンポーネント
│   │   └── Layout.astro
│   ├── pages/              # ページ（ルーティング）
│   │   ├── index.astro
│   │   ├── salon/
│   │   │   └── [id].astro
│   │   ├── news/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   └── recruit/
│   │       └── index.astro
│   ├── lib/                # ユーティリティ・ライブラリ
│   │   ├── seo/
│   │   │   └── jsonld.ts
│   │   └── utils/
│   │       └── haversine.ts
│   ├── types/              # TypeScript型定義
│   │   └── index.ts
│   └── data/               # モックデータ
│       ├── salons.json
│       ├── news.json
│       └── prefectures.json
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

## コンポーネント設計

### 基本原則
1. **再利用性**: 複数のページで使用できるコンポーネント
2. **型安全性**: TypeScriptの型定義を活用
3. **アクセシビリティ**: セマンティックHTMLとARIA属性
4. **レスポンシブ**: モバイルファーストデザイン

### コンポーネント一覧

#### SalonCard
- **用途**: 店舗情報のカード表示
- **Props**: `Salon`型の店舗データ
- **機能**: 店舗詳細へのリンク、予約ボタン

#### NewsCard
- **用途**: ニュース記事のカード表示
- **Props**: `News`型のニュースデータ、`featured`フラグ
- **機能**: 記事詳細へのリンク、日付・カテゴリ表示

#### LocatorFilters
- **用途**: 地域による店舗検索フィルター
- **Props**: `Prefecture[]`型の都道府県データ
- **機能**: 都道府県・市区町村選択、検索実行

## データ設計

### 型定義

#### Salon（店舗）
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

#### News（ニュース）
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

### モックデータ
現在は静的なJSONファイルを使用していますが、将来的にはWordPress REST APIから動的に取得する予定です。

## ルーティング

### 静的ルート
- `/` - トップページ
- `/news/` - ニュース一覧
- `/recruit/` - 採用情報

### 動的ルート
- `/salon/[id]` - 店舗詳細（SSG）
- `/news/[id]` - ニュース詳細（SSG）

### SSG（Static Site Generation）
店舗詳細とニュース詳細は静的生成を使用し、ビルド時にページを生成します。

## SEO対応

### メタタグ
- タイトル、説明文、OGP画像
- Twitter Card対応
- 構造化データ（JSON-LD）

### 構造化データ
- 店舗: `HairSalon`スキーマ
- ニュース: `NewsArticle`スキーマ
- 採用: `WebPage`スキーマ

## スタイリング

### Tailwind CSS
- ユーティリティファーストアプローチ
- カスタムカラーパレット（ピンク系）
- レスポンシブデザイン

### カラーパレット
- プライマリ: ピンク（#EC4899）
- セカンダリ: パープル（#8B5CF6）
- グレー: ニュートラルグレー

## パフォーマンス

### 最適化項目
- 画像の遅延読み込み
- CSS/JSの最小化
- 静的生成による高速表示

### 将来の最適化
- Cloudflare Imagesによる画像最適化
- CDNキャッシュの活用
- コード分割

## 開発ワークフロー

### 1. 機能開発
1. 型定義の作成・更新
2. コンポーネントの実装
3. ページの実装
4. スタイリングの適用

### 2. テスト
1. ローカル環境での動作確認
2. レスポンシブデザインの確認
3. アクセシビリティの確認

### 3. デプロイ
1. ビルドの実行
2. Cloudflare Pagesへのデプロイ
3. 本番環境での動作確認

## 今後の実装予定

### Phase 1: 基本機能（完了）
- [x] 静的サイトの構築
- [x] モックデータでの動作確認
- [x] 基本的なUIコンポーネント

### Phase 2: WordPress連携
- [ ] WordPress REST API連携
- [ ] Cloudflare Workers実装
- [ ] 動的データ取得
- [ ] 画像最適化

### Phase 3: 高度な機能
- [ ] 検索機能の強化
- [ ] パフォーマンス最適化
- [ ] 監視・ログ機能

## トラブルシューティング

### よくある問題

#### ビルドエラー
- TypeScriptの型エラーを確認
- インポートパスの確認
- 依存関係の確認

#### スタイリングの問題
- Tailwind CSSクラスの確認
- レスポンシブデザインの確認
- ブラウザの開発者ツールで確認

#### パフォーマンスの問題
- 画像の最適化
- 不要なJavaScriptの削除
- キャッシュの確認

## 参考資料

- [Astro公式ドキュメント](https://docs.astro.build/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Cloudflare Pages公式ドキュメント](https://developers.cloudflare.com/pages/)
