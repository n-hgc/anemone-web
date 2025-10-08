# 🎨 Tailwind CSS v4 仕様書

## 🎯 対象読者
- フロントエンド開発者
- デザインシステム管理者

## 📋 目次
1. [基本概念](#基本概念)
2. [@themeディレクティブ](#themeディレクティブ)
3. [カスタムクラス定義](#カスタムクラス定義)
4. [レスポンシブ対応](#レスポンシブ対応)
5. [v3からの変更点](#v3からの変更点)

---

## 🏗️ 基本概念

### アーキテクチャ
```css
@import "tailwindcss";

@theme {
  /* カスタムプロパティの定義 */
}

/* カスタムユーティリティクラス */
```

### レイヤー構造
- `@layer base`: ベーススタイル
- `@layer components`: コンポーネントスタイル
- `@layer utilities`: ユーティリティクラス

---

## 🎨 @themeディレクティブ

### カラーパレット
```css
@theme {
  --color-brown: #69552E;
  --color-beige: #FAF4E8;
  --color-black: #3D3D3D;
  --color-white: #FFFFFF;
}
```

### タイポグラフィ
```css
@theme {
  --font-family-yumincho: 'Shippori Mincho', serif;
  --font-family-zenkaku: 'Zen Kaku Gothic New', sans-serif;
  --font-size-h2-pc: 64px;
  --font-size-h3-pc: 24px;
  --font-size-p-pc: 16px;
  --line-height-h2-pc: 100%;
  --line-height-h3-pc: 150%;
  --line-height-p-pc: 150%;
  --font-weight-medium: 500;
  --font-weight-regular: 400;
}
```

### ブレークポイント
```css
@theme {
  --breakpoint-pc: 768px;
}
```

---

## 🛠️ カスタムクラス定義

### フォントクラス
```css
.font-yumincho {
  font-family: var(--font-family-yumincho) !important;
}

.font-zenkaku {
  font-family: var(--font-family-zenkaku) !important;
}
```

### タイポグラフィクラス
```css
.text-h2-pc {
  font-size: var(--font-size-h2-pc) !important;
  line-height: var(--line-height-h2-pc) !important;
  font-weight: var(--font-weight-medium) !important;
  font-family: var(--font-family-yumincho) !important;
}

.text-h3-pc {
  font-size: var(--font-size-h3-pc) !important;
  line-height: var(--line-height-h3-pc) !important;
  font-weight: var(--font-weight-medium) !important;
  font-family: var(--font-family-yumincho) !important;
}

.text-p-pc {
  font-size: var(--font-size-p-pc) !important;
  line-height: var(--line-height-p-pc) !important;
  font-weight: var(--font-weight-regular) !important;
  font-family: var(--font-family-zenkaku) !important;
}
```

### カラークラス
```css
.bg-brown { background-color: var(--color-brown); }
.bg-beige { background-color: var(--color-beige); }
.text-brown { color: var(--color-brown); }
.text-black { color: var(--color-black); }
```

---

## 📱 レスポンシブ対応

### メディアクエリ
```css
@media (min-width: 768px) {
  .pc\:text-h2-pc {
    font-size: var(--font-size-h2-pc) !important;
    line-height: var(--line-height-h2-pc) !important;
    font-weight: var(--font-weight-medium) !important;
    font-family: var(--font-family-yumincho) !important;
  }
}
```

### ブレークポイントの使用
- **SP**: 767px以下
- **PC**: 768px以上

---

## 🔄 v3からの変更点

### 設定ファイル
- **v3**: `tailwind.config.js`を使用
- **v4**: `@theme`ディレクティブを使用

### カスタムプロパティ
- **v3**: JavaScriptオブジェクトで定義
- **v4**: CSS変数で定義

### クラス生成
- **v3**: 設定ファイルから自動生成
- **v4**: 手動でカスタムクラスを定義

---

## 📚 参考資料

### 公式ドキュメント
- [Tailwind CSS v4公式ドキュメント](https://tailwindcss.com/docs)
- [v4新機能ガイド](https://tailwindcss.com/blog/tailwindcss-v4-alpha)

### 移行ガイド
- [v3からv4への移行](https://tailwindcss.com/docs/v4-migration)

---

**最終更新日: 2024年12月19日**
