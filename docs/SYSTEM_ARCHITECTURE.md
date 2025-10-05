# 🏗️ システム構成

## 🎯 対象読者
- アーキテクト
- プロジェクトマネージャー
- 新規開発者

## 📋 目次
1. [全体構成](#全体構成)
2. [ファイル構成](#ファイル構成)
3. [データフロー](#データフロー)
4. [技術スタック](#技術スタック)
5. [設計原則](#設計原則)

---

## 🏗️ 全体構成

### アーキテクチャ図
```
┌─────────────────────────────────────────────────────────────┐
│                    Design System Layer                     │
├─────────────────────────────────────────────────────────────┤
│  design-system-config.json (Single Source of Truth)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Code Generation Layer                    │
├─────────────────────────────────────────────────────────────┤
│  scripts/figma-mcp-integration.js                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Implementation Layer                    │
├─────────────────────────────────────────────────────────────┤
│  global.css (Tailwind v4)  │  design-system/index.ts     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Layout.astro  │  Components  │  Pages                    │
└─────────────────────────────────────────────────────────────┘
```

### レイヤー説明
1. **Design System Layer**: デザイントークンの定義
2. **Code Generation Layer**: 自動生成スクリプト
3. **Implementation Layer**: 実装用のファイル
4. **Application Layer**: 実際のアプリケーション

---

## 📁 ファイル構成

### ルートディレクトリ
```
anemone-web/
├── docs/                          # ドキュメント
│   ├── README.md
│   ├── DEVELOPMENT_GUIDE.md
│   ├── TAILWIND_V4_SPEC.md
│   ├── ASTRO_IMPLEMENTATION.md
│   ├── TROUBLESHOOTING.md
│   └── SYSTEM_ARCHITECTURE.md
├── design-system-config.json      # デザインシステム設定（SSOT）
└── scripts/
    └── figma-mcp-integration.js   # 自動生成スクリプト
```

### アプリケーションディレクトリ
```
app/
├── src/
│   ├── layouts/
│   │   └── Layout.astro           # ベースレイアウト
│   ├── pages/
│   │   ├── index.astro            # ホームページ
│   │   └── test.astro             # テストページ
│   ├── components/
│   │   ├── SalonCard.astro        # サロンカード
│   │   └── NewsCard.astro         # ニュースカード
│   ├── lib/
│   │   └── design-system/
│   │       └── index.ts           # デザインシステムユーティリティ
│   └── styles/
│       └── global.css             # グローバルCSS
├── public/
│   └── favicon.svg                # ファビコン
└── package.json                   # 依存関係
```

---

## 🔄 データフロー

### デザインシステムの更新フロー
```
1. design-system-config.json を編集
           │
           ▼
2. npm run figma:sync を実行
           │
           ▼
3. global.css が自動生成
           │
           ▼
4. design-system/index.ts が自動生成
           │
           ▼
5. アプリケーションで使用
```

### 開発フロー
```
1. デザイントークンの変更
           │
           ▼
2. 自動生成スクリプトの実行
           │
           ▼
3. コンポーネントの実装
           │
           ▼
4. ブラウザでの確認
           │
           ▼
5. 問題があればデバッグ
```

---

## 🛠️ 技術スタック

### フロントエンド
- **Astro v5**: 静的サイトジェネレーター
- **Tailwind CSS v4**: ユーティリティファーストCSS
- **TypeScript**: 型安全なJavaScript

### 開発ツール
- **Node.js v18+**: ランタイム環境
- **npm**: パッケージマネージャー
- **Vite**: ビルドツール

### デザインシステム
- **Figma MCP**: デザインツール連携
- **Google Fonts**: フォント提供
- **CSS Variables**: テーマ管理

---

## 🎯 設計原則

### 1. 単一の情報源（SSOT）
- `design-system-config.json`を唯一の情報源とする
- すべてのデザイントークンはここで管理

### 2. 自動化
- 手動でのファイル編集を最小限に抑制
- スクリプトによる自動生成を活用

### 3. 保守性
- 明確なファイル構成
- 適切な抽象化レベル
- ドキュメントの充実

### 4. 拡張性
- 新しいデザイントークンの追加が容易
- コンポーネントの再利用性
- レスポンシブデザインの対応

### 5. パフォーマンス
- 最小限のCSS
- フォントの最適化
- キャッシュの活用

---

## 🔧 設定ファイル

### design-system-config.json
```json
{
  "figma": {
    "fileId": "your-file-id",
    "accessToken": "your-access-token"
  },
  "colors": {
    "text": {
      "black": "#3D3D3D",
      "grey_medium": "#878C92"
    },
    "background": {
      "beige": "#FAF4E8",
      "white": "#FFFFFF"
    }
  },
  "typography": {
    "h2-pc": {
      "fontSize": "64px",
      "fontWeight": "500",
      "lineHeight": "100%",
      "fontFamily": ["YuMincho", "serif"]
    }
  }
}
```

### package.json
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "figma:sync": "node ../scripts/figma-mcp-integration.js",
    "figma:watch": "nodemon ../scripts/figma-mcp-integration.js"
  }
}
```

---

## 📊 パフォーマンス指標

### 目標値
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### 最適化戦略
- フォントの事前読み込み
- CSSの最小化
- 画像の最適化
- キャッシュの活用

---

**最終更新日: 2024年12月19日**
