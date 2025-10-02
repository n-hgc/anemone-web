# Figma MCP統合ガイド

## 概要

Figma MCP（Model Context Protocol）を使用して、Figmaのデザインデータを直接コードに変換し、デザインの精度を向上させるためのガイドです。

## セットアップ手順

### 1. Figma MCPサーバーの有効化

1. **Figmaデスクトップアプリを開く**
2. **任意のデザインファイルを開く**
3. **左上のメニュー → 基本設定**
4. **「Dev Mode MCPサーバーを有効にする」をクリック**
5. **「Dev Mode MCP server enabled on localhost:3845/sse」のメッセージを確認**

### 2. CursorでのMCPサーバー設定

1. **Cursorを開く**
2. **設定画面に移動**
3. **「Tools & Integrations」タブを選択**
4. **「Add Custom MCP」をクリック**
5. **`.cursor/mcp-config.json`の内容を設定に追加**

### 3. デザインシステム設定

`design-system-config.json`ファイルでFigmaファイルのURLとデザインシステムの設定を行います：

```json
{
  "figma": {
    "fileUrl": "YOUR_FIGMA_FILE_URL_HERE",
    "designSystem": {
      "colors": {
        "primary": "pink-600",
        "secondary": "purple-600"
      }
    }
  }
}
```

## 使用方法

### 1. デザインの同期

```bash
# Figmaからデザインデータを同期
npm run figma:sync

# 設定ファイルの変更を監視して自動同期
npm run figma:watch
```

### 2. デザインシステムの活用

```typescript
// デザインシステムのトークンを使用
import { designTokens, componentClasses } from '../lib/design-system';

// カラーの使用
const primaryColor = designTokens.colors.primary[600];

// コンポーネントクラスの使用
const buttonClass = componentClasses.button.primary;
```

### 3. コンポーネントの更新

Figmaでデザインを更新した後：

1. **Figma MCPサーバーが有効になっていることを確認**
2. **`npm run figma:sync`を実行**
3. **自動生成されたクラスを確認**
4. **必要に応じてコンポーネントを更新**

## ベストプラクティス

### 1. デザインの構造化

- **コンポーネントを小さな単位に分割**
- **一貫した命名規則を使用**
- **デザインシステムのトークンを活用**

### 2. コード生成の精度向上

- **Figmaのレイヤー名を分かりやすく設定**
- **コンポーネントを適切にグループ化**
- **バリアントを活用してバリエーションを管理**

### 3. 開発ワークフロー

1. **Figmaでデザインを作成・更新**
2. **MCPサーバーでデザインデータを取得**
3. **自動生成されたクラスを確認**
4. **コンポーネントに適用**
5. **動作確認・調整**

## トラブルシューティング

### よくある問題

#### 1. MCPサーバーに接続できない
- **Figmaデスクトップアプリが起動しているか確認**
- **MCPサーバーが有効になっているか確認**
- **ポート3845が使用可能か確認**

#### 2. デザインデータが取得できない
- **FigmaファイルのURLが正しいか確認**
- **ファイルへのアクセス権限があるか確認**
- **ネットワーク接続を確認**

#### 3. 生成されたクラスが期待通りでない
- **Figmaのレイヤー名を確認**
- **コンポーネントの構造を確認**
- **設定ファイルの内容を確認**

### デバッグ方法

1. **ブラウザの開発者ツールでネットワークタブを確認**
2. **Figma MCPサーバーのログを確認**
3. **生成されたファイルの内容を確認**

## 高度な設定

### 1. カスタムトークンの追加

```json
{
  "figma": {
    "customTokens": {
      "brand": {
        "primary": "#ec4899",
        "secondary": "#8b5cf6"
      }
    }
  }
}
```

### 2. コンポーネントバリアントの管理

```json
{
  "figma": {
    "components": {
      "button": {
        "variants": ["primary", "secondary", "outline"],
        "states": ["default", "hover", "active", "disabled"]
      }
    }
  }
}
```

### 3. レスポンシブデザインの設定

```json
{
  "figma": {
    "responsive": {
      "breakpoints": {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px"
      }
    }
  }
}
```

## 参考資料

- [Figma MCP公式ドキュメント](https://help.figma.com/hc/ja/articles/32132100833559-Dev-Mode-MCP%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E5%88%A9%E7%94%A8%E3%82%AC%E3%82%A4%E3%83%89)
- [Model Context Protocol仕様](https://modelcontextprotocol.io/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
