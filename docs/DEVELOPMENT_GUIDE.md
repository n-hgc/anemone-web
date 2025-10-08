# 🚀 開発ガイド

## 🎯 対象読者
- 新規開発者
- 既存開発者（手順確認用）

## 📋 目次
1. [環境構築](#環境構築)
2. [開発フロー](#開発フロー)
3. [実装手順](#実装手順)
4. [品質管理](#品質管理)

---

## 🛠️ 環境構築

### 必要な環境
- Node.js v18以上
- npm または yarn
- Astro v5以上
- Tailwind CSS v4

### セットアップ手順
```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd anemone-web

# 2. 依存関係のインストール
cd app
npm install

# 3. 開発サーバーの起動
npm run dev
```

### 動作確認
- ブラウザで `http://localhost:4322` にアクセス
- フォントとスタイルが正しく表示されることを確認

---

## 🔄 開発フロー

### 1. デザイントークンの変更
```bash
# design-system-config.json を編集
vim design-system-config.json

# 自動生成スクリプトを実行
npm run figma:sync
```

### 2. コンポーネントの作成
```bash
# 新しいコンポーネントを作成
touch src/components/NewComponent.astro
```

### 3. ページの作成
```bash
# 新しいページを作成
touch src/pages/new-page.astro
```

---

## 💻 実装手順

### 基本的なページ構造
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

### 利用可能なクラス
- **タイポグラフィ**: `.text-h2-pc`, `.text-h3-pc`, `.text-p-pc`
- **フォント**: `.font-yumincho`, `.font-zenkaku`
- **カラー**: `.text-black`, `.bg-beige`, `.text-brown`
- **レスポンシブ**: `.pc:text-h2-pc`, `.pc:text-h3-pc`

---

## ✅ 品質管理

### コードレビューチェックリスト
- [ ] デザインシステムのクラスを使用している
- [ ] レスポンシブデザインに対応している
- [ ] アクセシビリティを考慮している
- [ ] パフォーマンスを最適化している

### テスト手順
1. **ブラウザテスト**: 複数のブラウザで表示確認
2. **レスポンシブテスト**: 異なる画面サイズで確認
3. **パフォーマンステスト**: Lighthouseでスコア確認

---

## 🚨 よくある問題

### CSSが反映されない
1. ブラウザのハードリフレッシュ (`Cmd + Shift + R`)
2. 開発者ツールでNetworkタブを確認
3. `Layout.astro`でCSSが読み込まれているか確認

### フォントが適用されない
1. Google Fontsの読み込みを確認
2. フォント名のスペルを確認
3. `!important`の使用を確認

---

**最終更新日: 2024年12月19日**
