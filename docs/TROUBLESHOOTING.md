# 🚨 トラブルシューティング

## 🎯 対象読者
- 開発者（問題解決時）
- デバッグ担当者

## 📋 目次
1. [問題の特定手順](#問題の特定手順)
2. [よくある問題と解決策](#よくある問題と解決策)
3. [デバッグツール](#デバッグツール)
4. [緊急時の対応](#緊急時の対応)

---

## 🔍 問題の特定手順

### 1. 症状の確認
- **何が起きているか**: 具体的な症状を記録
- **いつから起きているか**: 変更履歴を確認
- **どの環境で起きているか**: 開発/本番環境の違いを確認

### 2. 段階的なデバッグ
```bash
# 1. HTMLの確認
curl -s "http://localhost:4322/test" | grep "font-yumincho"

# 2. CSSの確認
curl -s "http://localhost:4322/src/styles/global.css" | grep "font-yumincho"

# 3. ファイルの更新確認
touch /path/to/global.css
```

### 3. ブラウザでの確認
1. **開発者ツール**: ElementsタブでHTMLを確認
2. **Networkタブ**: CSSファイルの読み込み状況を確認
3. **Consoleタブ**: エラーメッセージを確認

---

## 🚨 よくある問題と解決策

### CSSが反映されない

#### 症状
- スタイルが適用されていない
- ブラウザでスタイルが表示されない

#### 原因
- グローバルCSSが読み込まれていない
- キャッシュの問題
- ファイルパスの間違い

#### 解決策
```astro
<!-- Layout.astroに追加 -->
<link rel="stylesheet" href="/src/styles/global.css">
```

```bash
# キャッシュクリア
rm -rf node_modules/.vite
npm run dev
```

### フォントが適用されない

#### 症状
- フォントが変更されない
- デフォルトフォントが表示される

#### 原因
- フォントの読み込み順序
- CSSの優先度の問題
- フォント名の間違い

#### 解決策
```css
.font-yumincho {
  font-family: var(--font-family-yumincho) !important;
}
```

```astro
<!-- フォントの事前読み込み -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### Tailwindクラスが効かない

#### 症状
- Tailwindのユーティリティクラスが適用されない
- カスタムクラスが効かない

#### 原因
- v3とv4の設定が混在
- `tailwind.config.js`が残っている
- `@theme`ディレクティブの設定ミス

#### 解決策
```bash
# tailwind.config.jsを削除
rm tailwind.config.js

# global.cssで@themeディレクティブを使用
@theme {
  --color-brown: #69552E;
}
```

### レスポンシブが効かない

#### 症状
- メディアクエリが動作しない
- 画面サイズに応じてスタイルが変わらない

#### 原因
- メディアクエリの記述ミス
- ブレークポイントの設定ミス
- CSSの優先度の問題

#### 解決策
```css
@media (min-width: 768px) {
  .pc\:text-h2-pc {
    font-size: var(--font-size-h2-pc) !important;
  }
}
```

---

## 🛠️ デバッグツール

### ブラウザ開発者ツール
- **Elementsタブ**: HTMLとCSSの確認
- **Networkタブ**: リソースの読み込み状況
- **Consoleタブ**: エラーメッセージの確認
- **Sourcesタブ**: ソースファイルの確認

### コマンドラインツール
```bash
# HTMLの確認
curl -s "http://localhost:4322/test" | grep "class="

# CSSの確認
curl -s "http://localhost:4322/src/styles/global.css" | grep "font-yumincho"

# ファイルの更新
touch /path/to/file.css
```

### デバッグ用ページ
```astro
---
// debug.astro
---

<Layout title="デバッグページ">
  <div class="min-h-screen bg-beige p-8">
    <h1 class="text-h2-pc text-black mb-8">デバッグページ</h1>
    
    <!-- フォントテスト -->
    <div class="mb-4">
      <h2 class="text-h3-pc text-black mb-2">フォントテスト</h2>
      <div class="font-yumincho text-p-pc text-black">
        これは.font-yuminchoクラスです
      </div>
    </div>
    
    <!-- カラーテスト -->
    <div class="mb-4">
      <h2 class="text-h3-pc text-black mb-2">カラーテスト</h2>
      <div class="bg-brown text-white p-4 rounded">
        これは.bg-brownクラスです
      </div>
    </div>
  </div>
</Layout>
```

---

## 🚨 緊急時の対応

### 完全にスタイルが効かない場合
1. **ブラウザのハードリフレッシュ**: `Cmd + Shift + R`
2. **キャッシュクリア**: 開発者ツール → Network → "Disable cache"
3. **プライベートブラウジング**: 新しいプライベートウィンドウで確認

### 開発サーバーが起動しない場合
```bash
# プロセスを確認
lsof -ti:4322

# プロセスを終了
kill -9 $(lsof -ti:4322)

# 再起動
npm run dev
```

### ファイルが更新されない場合
```bash
# ファイルの更新時刻を変更
touch /path/to/file

# 開発サーバーの再起動
npm run dev
```

---

## 📞 サポート

### 内部リソース
- [開発ガイド](./DEVELOPMENT_GUIDE.md)
- [Tailwind CSS v4仕様](./TAILWIND_V4_SPEC.md)
- [Astro実装仕様](./ASTRO_IMPLEMENTATION.md)

### 外部リソース
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
- [Astro公式ドキュメント](https://docs.astro.build/)

---

**最終更新日: 2024年12月19日**
