# WordPress 5.8 設定手順書

## 概要
WordPress 5.8でのREST API連携設定手順です。Basic認証を使用してフロントエンドと連携します。

## 必要なプラグイン

### 1. 必須プラグイン
```
WordPress管理画面 → プラグイン → 新規追加
```

1. **Advanced Custom Fields (ACF)** - カスタムフィールド管理
2. **Custom Post Type UI** - カスタム投稿タイプを簡単作成
3. **Basic Authentication** - REST API認証用
4. **CORS** - フロントエンドからのアクセス許可

### 2. プラグインのインストール方法
1. WordPress管理画面にログイン
2. 「プラグイン」→「新規追加」
3. 上記プラグイン名で検索
4. 「今すぐインストール」→「有効化」

## カスタム投稿タイプの設定

### 1. Custom Post Type UIで作成
```
WordPress管理画面 → CPT UI → Add/Edit Post Types
```

**設定内容:**
- **Post Type Slug**: `salon`
- **Plural Label**: `店舗情報`
- **Singular Label**: `店舗`
- **Public**: ✅ チェック
- **Show in REST API**: ✅ チェック
- **Supports**: Title, Editor, Thumbnail, Custom Fields をチェック
- **Menu Icon**: `dashicons-store`
- **Menu Position**: `5`

### 2. カスタム分類の作成
```
WordPress管理画面 → CPT UI → Add/Edit Taxonomies
```

**作成する分類:**

#### 地域分類
- **Taxonomy Slug**: `salon_region`
- **Plural Label**: `地域`
- **Singular Label**: `地域`
- **Attach to Post Type**: `salon` をチェック
- **Show in REST API**: ✅ チェック

#### 都道府県分類
- **Taxonomy Slug**: `salon_prefecture`
- **Plural Label**: `都道府県`
- **Singular Label**: `都道府県`
- **Attach to Post Type**: `salon` をチェック
- **Show in REST API**: ✅ チェック

#### 市区町村分類
- **Taxonomy Slug**: `salon_city`
- **Plural Label**: `市区町村`
- **Singular Label**: `市区町村`
- **Attach to Post Type**: `salon` をチェック
- **Show in REST API**: ✅ チェック

#### 採用状況分類
- **Taxonomy Slug**: `recruit_status`
- **Plural Label**: `採用状況`
- **Singular Label**: `採用状況`
- **Attach to Post Type**: `salon` をチェック
- **Show in REST API**: ✅ チェック

#### 職種分類
- **Taxonomy Slug**: `job_type`
- **Plural Label**: `職種`
- **Singular Label**: `職種`
- **Attach to Post Type**: `salon` をチェック
- **Show in REST API**: ✅ チェック

#### 雇用形態分類
- **Taxonomy Slug**: `employment_type`
- **Plural Label**: `雇用形態`
- **Singular Label**: `雇用形態`
- **Attach to Post Type**: `salon` をチェック
- **Show in REST API**: ✅ チェック

## ACFフィールドの設定

### 1. フィールドグループの作成
```
WordPress管理画面 → カスタムフィールド → フィールドグループ → 新規追加
```

**フィールドグループ名**: `店舗情報`

### 2. フィールドの設定

#### 基本情報タブ
```
基本情報 (タブ)
├── 住所 (text)
├── 電話番号 (text)
├── 営業時間 (text)
├── 支払い方法 (text)
├── 施設情報 (repeater)
│   ├── 施設名 (text)
│   └── 説明 (textarea)
├── 予約URL (url)
├── 緯度 (number)
├── 経度 (number)
└── Google My Business ID (text)
```

#### 採用情報タブ
```
採用情報 (タブ)
├── 採用情報を表示する (true_false)
├── 募集状況 (select)
│   ├── 募集中
│   ├── 募集停止
│   └── 準備中
├── 採用説明文 (wysiwyg)
├── 勤務時間 (text)
├── 給与情報 (text)
├── 福利厚生 (repeater)
│   └── 福利厚生名 (text)
├── 募集職種 (repeater)
│   └── 職種名 (text)
├── 雇用形態 (repeater)
│   └── 雇用形態名 (text)
├── 経験レベル (repeater)
│   └── レベル名 (text)
├── 応募URL (url)
└── 採用問い合わせ先 (text)
```

#### スタッフ情報タブ
```
スタッフ情報 (タブ)
└── 在籍スタッフ (repeater)
    ├── スタッフ名 (text)
    ├── 役職 (text)
    ├── スタッフ画像 (image)
    ├── スタッフ紹介文 (textarea)
    ├── 得意分野 (repeater)
    │   └── 分野名 (text)
    └── SNS情報 (repeater)
        ├── SNS名 (text)
        └── URL (url)
```

#### 画像・メディアタブ
```
画像・メディア (タブ)
├── メイン画像 (image)
├── 店内画像 (gallery)
├── 外観画像 (gallery)
├── 採用関連画像 (gallery)
└── スタッフギャラリー (gallery)
```

### 3. フィールドグループの設定
- **位置**: 投稿タイプが「店舗」と等しい
- **表示順序**: 標準（メタボックス）の下
- **スタイル**: 標準

## functions.phpの設定

### 1. functions.phpに追加
`wordpress-5.8-functions.php`の内容をWordPressの`functions.php`に追加してください。

### 2. 設定内容
- カスタム投稿タイプの登録
- カスタム分類の登録
- ACFフィールドのREST API公開
- CORS設定
- カスタムフィールドのREST API公開

## 初期データの登録

### 1. 分類データの登録
```
WordPress管理画面 → 店舗 → 地域（または各分類）
```

**地域:**
- 北海道
- 東北
- 関東
- 中部
- 関西
- 中国・四国
- 九州・沖縄

**職種:**
- アシスタント
- スタイリスト
- 店長
- 副店長

**雇用形態:**
- 正社員
- パート・アルバイト
- 業務委託
- 新卒
- 中途

### 2. サンプル店舗データの登録
```
WordPress管理画面 → 店舗 → 新規追加
```

1. タイトル: 「渋谷店」
2. 基本情報を入力
3. 採用情報を入力
4. スタッフ情報を入力
5. 画像をアップロード
6. 分類を選択
7. 公開

## 環境変数の設定

### 1. .env.localファイルの作成
```bash
# WordPress REST API設定
WP_API_URL=https://your-wordpress-site.com/wp-json/wp/v2

# WordPress Basic認証設定
WP_BASIC_AUTH_USERNAME=your_username
WP_BASIC_AUTH_PASSWORD=your_password

# 開発環境設定
NODE_ENV=development
```

## テスト方法

### 1. WordPress REST APIの直接確認
```bash
# 公開データの確認
curl https://your-wordpress-site.com/wp-json/wp/v2/salon

# 認証が必要なデータの確認
curl -u username:password https://your-wordpress-site.com/wp-json/wp/v2/salon
```

### 2. フロントエンドでの確認
```bash
# 開発サーバー起動
npm run dev

# テストページにアクセス
http://localhost:4321/wp-test
```

## トラブルシューティング

### 1. よくある問題

#### ACFフィールドが表示されない
- `functions.php`にACFフィールドのREST API公開コードが追加されているか確認
- ACFプラグインが有効化されているか確認

#### CORSエラーが発生する
- CORSプラグインが有効化されているか確認
- `functions.php`にCORS設定が追加されているか確認

#### 認証エラーが発生する
- Basic認証プラグインが有効化されているか確認
- ユーザー名とパスワードが正しいか確認
- `.env.local`の設定が正しいか確認

### 2. デバッグ方法

#### WordPress側のデバッグ
```php
// wp-config.phpに追加
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

#### フロントエンド側のデバッグ
```bash
# 開発者ツールのコンソールでエラーを確認
# ネットワークタブでAPIリクエストを確認
```

## 完了確認

### 1. チェックリスト
- [ ] プラグインがインストール・有効化されている
- [ ] カスタム投稿タイプが作成されている
- [ ] カスタム分類が作成されている
- [ ] ACFフィールドが設定されている
- [ ] functions.phpが更新されている
- [ ] サンプルデータが登録されている
- [ ] 環境変数が設定されている
- [ ] REST APIが正常に動作している
- [ ] フロントエンドでデータが表示されている

### 2. 成功の確認
- テストページで「✅ 接続成功」が表示される
- 店舗データが正常に取得・表示される
- エラーが発生しない

これでWordPress 5.8での設定が完了です！
