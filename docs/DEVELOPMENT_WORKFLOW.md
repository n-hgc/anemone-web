# 開発ワークフロー

## 概要

このドキュメントでは、Figma MCPの問題を回避し、将来的なWordPress REST API移行を考慮した開発手順について説明します。

## 🎯 開発方針

### 1. データレイヤーの抽象化
- API呼び出しを抽象化して、モックデータとWordPress REST APIを簡単に切り替え可能
- 型安全性を保ちながら、将来的な移行を容易にする

### 2. 段階的開発
1. **Phase 1**: モックデータでの開発・デザイン実装
2. **Phase 2**: WordPress REST API連携
3. **Phase 3**: 本番環境での最適化

## 🚀 開発手順

### 1. 環境セットアップ

```bash
# 依存関係のインストール
cd app
npm install

# 環境変数の設定
cp env.example .env.local
# .env.localを編集して必要な設定を追加

# 開発サーバーの起動
npm run dev
```

### 2. データソースの切り替え

#### モックデータを使用（開発時）
```typescript
// src/lib/api/index.ts
const API_CONFIG = {
  useMockData: true, // モックデータを使用
  wpApiUrl: 'https://wp.example.com/wp-json/wp/v2',
  cacheTimeout: 5 * 60 * 1000,
};
```

#### WordPress REST APIを使用（本番時）
```typescript
// src/lib/api/index.ts
const API_CONFIG = {
  useMockData: false, // WordPress REST APIを使用
  wpApiUrl: 'https://your-wordpress-site.com/wp-json/wp/v2',
  cacheTimeout: 15 * 60 * 1000,
};
```

### 3. デザイン実装

#### コンポーネント作成
```typescript
// src/components/SalonCard.astro
---
import { api } from '../lib/api';
import type { Salon } from '../types';

// APIからデータを取得
const response = await api.getSalons();
const salons = response.data || [];
---

<div class="salon-grid">
  {salons.map((salon) => (
    <div class="salon-card">
      <h3>{salon.title}</h3>
      <p>{salon.acf.address}</p>
      <!-- その他の表示内容 -->
    </div>
  ))}
</div>
```

#### スタイリング
```css
/* src/styles/components.css */
.salon-card {
  @apply bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500;
  @apply border border-gray-100 hover:border-pink-200 hover:-translate-y-2;
}

.salon-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8;
}
```

### 4. データ構造の管理

#### モックデータの更新
```json
// src/data/salons-enhanced.json
{
  "id": 1,
  "title": "渋谷店",
  "slug": "shibuya",
  "status": "publish",
  "acf": {
    "address": "東京都渋谷区渋谷1-1-1",
    "tel": "03-1234-5678",
    // その他のカスタムフィールド
  },
  "meta": {
    "prefecture": "東京都",
    "city": "渋谷区"
  }
}
```

#### 型定義の更新
```typescript
// src/types/index.ts
export interface Salon {
  id: number;
  title: string;
  slug: string;
  status: 'publish' | 'draft' | 'private';
  acf: {
    address: string;
    tel: string;
    // その他のカスタムフィールド
  };
  meta: {
    prefecture: string;
    city: string;
  };
}
```

## 🔄 移行手順

### WordPress REST APIへの移行

#### 1. WordPress側の準備
```php
// functions.php
// カスタム投稿タイプの登録
register_post_type('salon', [
  'public' => true,
  'show_in_rest' => true,
  'rest_base' => 'salons',
  // その他の設定
]);

// カスタムフィールドのREST API公開
register_rest_field('salon', 'acf', [
  'get_callback' => function($object) {
    return get_fields($object['id']);
  }
]);
```

#### 2. フロントエンド側の変更
```typescript
// src/lib/api/index.ts
// 設定を変更するだけ
API_CONFIG.useMockData = false;
API_CONFIG.wpApiUrl = 'https://your-wordpress-site.com/wp-json/wp/v2';
```

#### 3. データ変換の確認
```typescript
// 必要に応じてデータ変換関数を使用
import { convertSalonToLegacy } from '../types';

const response = await api.getSalons();
const salons = response.data.map(convertSalonToLegacy);
```

## 🛠️ 開発ツール

### 1. デバッグ
```typescript
// src/lib/config/development.ts
export const config = {
  debug: {
    logLevel: 'info',
    logApiCalls: true,
    measurePerformance: true
  }
};
```

### 2. キャッシュ管理
```typescript
// キャッシュのクリア
import { api } from '../lib/api';
api.clearCache();

// キャッシュの無効化
const response = await api.getSalons({}, false); // キャッシュを使用しない
```

### 3. パフォーマンス監視
```typescript
// パフォーマンス測定
const startTime = performance.now();
const response = await api.getSalons();
const endTime = performance.now();
console.log(`API call took ${endTime - startTime} milliseconds`);
```

## 📝 ベストプラクティス

### 1. コンポーネント設計
- 単一責任の原則に従う
- 再利用可能なコンポーネントを作成
- 型安全性を保つ

### 2. データ管理
- APIレスポンスの型定義を明確にする
- エラーハンドリングを適切に実装
- キャッシュ戦略を考慮する

### 3. スタイリング
- デザインシステムを一貫して使用
- レスポンシブデザインを考慮
- アクセシビリティを重視

### 4. テスト
- コンポーネントの単体テスト
- API呼び出しのテスト
- 統合テストの実装

## 🚨 注意事項

### 1. 型安全性
- TypeScriptの型定義を常に最新に保つ
- 実行時型チェックを必要に応じて実装

### 2. パフォーマンス
- 不要なAPI呼び出しを避ける
- 適切なキャッシュ戦略を実装
- 画像の最適化を考慮

### 3. セキュリティ
- APIキーの適切な管理
- 入力値の検証
- XSS対策の実装

## 📚 参考資料

- [Astro公式ドキュメント](https://docs.astro.build/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
