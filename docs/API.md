# API仕様書

## 概要

Anemone SalonのヘッドレスWebサイトで使用するAPIの仕様書です。現在はモックデータを使用していますが、将来的にはWordPress REST APIとCloudflare Workersを経由してデータを取得する予定です。

## データフロー

```
WordPress 5.8.11 (Headless CMS)
    ↓
Cloudflare Workers (API Proxy)
    ↓
Astro Frontend (Static Site)
```

## エンドポイント一覧

### 店舗関連

#### GET /api/salons
店舗一覧を取得します。

**レスポンス例:**
```json
[
  {
    "id": 1,
    "name": "渋谷店",
    "address": "東京都渋谷区渋谷1-1-1",
    "tel": "03-1234-5678",
    "hours": "10:00-20:00（定休日：火曜日）",
    "payment": "現金、クレジットカード、電子マネー",
    "facilities": ["Wi-Fi", "駐車場", "ペット可"],
    "geo": {
      "lat": 35.6581,
      "lng": 139.7016
    },
    "prefecture": "東京都",
    "city": "渋谷区",
    "photos": [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop"
    ],
    "reservation_url": "https://example.com/reserve/shibuya",
    "gmb_place_id": "ChIJd8BlQ2BZwokRAFQEcDlJRAI"
  }
]
```

#### GET /api/salons/{id}
特定の店舗情報を取得します。

**パラメータ:**
- `id` (number): 店舗ID

**レスポンス例:**
```json
{
  "id": 1,
  "name": "渋谷店",
  "address": "東京都渋谷区渋谷1-1-1",
  "tel": "03-1234-5678",
  "hours": "10:00-20:00（定休日：火曜日）",
  "payment": "現金、クレジットカード、電子マネー",
  "facilities": ["Wi-Fi", "駐車場", "ペット可"],
  "geo": {
    "lat": 35.6581,
    "lng": 139.7016
  },
  "prefecture": "東京都",
  "city": "渋谷区",
  "photos": [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop"
  ],
  "reservation_url": "https://example.com/reserve/shibuya",
  "gmb_place_id": "ChIJd8BlQ2BZwokRAFQEcDlJRAI"
}
```

### ニュース関連

#### GET /api/news
ニュース一覧を取得します。

**クエリパラメータ:**
- `category` (string, optional): カテゴリでフィルタ
- `limit` (number, optional): 取得件数（デフォルト: 10）
- `offset` (number, optional): オフセット（デフォルト: 0）

**レスポンス例:**
```json
[
  {
    "id": 1,
    "title": "新店舗「横浜店」オープンのお知らせ",
    "excerpt": "神奈川県横浜市西区みなとみらいに新店舗「アネモネサロン横浜店」をオープンいたします。",
    "date": "2024-01-15",
    "categories": ["お知らせ", "新店舗"],
    "tags": ["横浜", "みなとみらい", "新店舗", "オープン"],
    "featured_image": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
    "slug": "yokohama-store-opening"
  }
]
```

#### GET /api/news/{id}
特定のニュース記事を取得します。

**パラメータ:**
- `id` (number): ニュースID

**レスポンス例:**
```json
{
  "id": 1,
  "title": "新店舗「横浜店」オープンのお知らせ",
  "content": "この度、神奈川県横浜市西区みなとみらいに新店舗「アネモネサロン横浜店」をオープンいたします。\n\n横浜店では、みなとみらいの美しい景色を眺めながら、リラックスしてお過ごしいただけます。",
  "excerpt": "神奈川県横浜市西区みなとみらいに新店舗「アネモネサロン横浜店」をオープンいたします。",
  "date": "2024-01-15",
  "categories": ["お知らせ", "新店舗"],
  "tags": ["横浜", "みなとみらい", "新店舗", "オープン"],
  "featured_image": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
  "slug": "yokohama-store-opening"
}
```

### 地域関連

#### GET /api/prefectures
都道府県一覧を取得します。

**レスポンス例:**
```json
[
  {
    "id": "tokyo",
    "name": "東京都",
    "cities": [
      "渋谷区",
      "新宿区",
      "港区"
    ]
  }
]
```

## エラーレスポンス

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## 認証

### Basic認証
WordPress REST APIへのアクセスにはBasic認証を使用します。

**ヘッダー:**
```
Authorization: Basic <base64-encoded-credentials>
```

### CORS
APIは以下のオリジンからのアクセスのみを許可します：
- `https://anemone-salon.com`
- `https://www.anemone-salon.com`

## キャッシュ

### キャッシュポリシー
- **店舗データ**: 1時間（3600秒）
- **ニュースデータ**: 30分（1800秒）
- **地域データ**: 24時間（86400秒）

### キャッシュヘッダー
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
```

## レート制限

### 制限値
- **一般API**: 100リクエスト/分
- **検索API**: 50リクエスト/分

### レート制限ヘッダー
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## 将来の実装予定

### WordPress REST API連携
現在のモックデータをWordPress REST APIからの動的データに置き換える予定です。

**実装予定のエンドポイント:**
- `GET /wp-json/wp/v2/salon` - 店舗一覧
- `GET /wp-json/wp/v2/salon/{id}` - 店舗詳細
- `GET /wp-json/wp/v2/posts?categories=news` - ニュース一覧
- `GET /wp-json/wp/v2/posts/{id}` - ニュース詳細

### Cloudflare Workers実装
WordPress REST APIへのプロキシとしてCloudflare Workersを実装する予定です。

**機能:**
- APIリクエストのプロキシ
- レスポンスのキャッシュ
- レート制限
- セキュリティヘッダーの追加

### 画像最適化
Cloudflare Imagesを使用した画像最適化を実装する予定です。

**機能:**
- 自動フォーマット変換（WebP/AVIF）
- レスポンシブ画像
- 遅延読み込み

## 開発・テスト

### ローカル開発
```bash
# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

### テスト用エンドポイント
開発環境では以下のエンドポイントが利用可能です：
- `http://localhost:4321/api/salons`
- `http://localhost:4321/api/news`
- `http://localhost:4321/api/prefectures`

## 監視・ログ

### ログレベル
- **ERROR**: エラー情報
- **WARN**: 警告情報
- **INFO**: 一般情報
- **DEBUG**: デバッグ情報

### メトリクス
- リクエスト数
- レスポンス時間
- エラー率
- キャッシュヒット率

## セキュリティ

### セキュリティヘッダー
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 入力検証
- パラメータの型チェック
- SQLインジェクション対策
- XSS対策

## 参考資料

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Astro Documentation](https://docs.astro.build/)
