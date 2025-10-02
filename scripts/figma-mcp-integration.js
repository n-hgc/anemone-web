#!/usr/bin/env node

/**
 * Figma MCP統合スクリプト
 * Figmaのデザインデータを取得し、Tailwind CSSクラスに変換する
 */

const fs = require('fs');
const path = require('path');

// 設定ファイルを読み込み
const configPath = path.join(__dirname, '..', 'design-system-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Figmaのデザインデータを解析してTailwindクラスを生成
 */
function generateTailwindClasses(figmaData) {
  const classes = {
    colors: {},
    spacing: {},
    typography: {},
    components: {}
  };

  // カラーパレットの生成
  if (figmaData.colors) {
    figmaData.colors.forEach(color => {
      const name = color.name.toLowerCase().replace(/\s+/g, '-');
      classes.colors[name] = {
        value: color.value,
        description: color.description || ''
      };
    });
  }

  // スペーシングの生成
  if (figmaData.spacing) {
    figmaData.spacing.forEach(space => {
      const name = space.name.toLowerCase().replace(/\s+/g, '-');
      classes.spacing[name] = {
        value: space.value,
        description: space.description || ''
      };
    });
  }

  // タイポグラフィの生成
  if (figmaData.typography) {
    figmaData.typography.forEach(type => {
      const name = type.name.toLowerCase().replace(/\s+/g, '-');
      classes.typography[name] = {
        fontSize: type.fontSize,
        fontWeight: type.fontWeight,
        lineHeight: type.lineHeight,
        letterSpacing: type.letterSpacing,
        description: type.description || ''
      };
    });
  }

  return classes;
}

/**
 * コンポーネントクラスを生成
 */
function generateComponentClasses(figmaComponents) {
  const components = {};

  figmaComponents.forEach(component => {
    const name = component.name.toLowerCase().replace(/\s+/g, '-');
    components[name] = {
      base: component.styles.base || '',
      variants: component.styles.variants || {},
      states: component.styles.states || {}
    };
  });

  return components;
}

/**
 * Tailwind設定ファイルを更新
 */
function updateTailwindConfig(classes) {
  const tailwindConfigPath = path.join(__dirname, '..', 'app', 'tailwind.config.js');
  
  const config = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          ...classes.colors,
          brand: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843'
          }
        },
        spacing: classes.spacing,
        fontSize: classes.typography,
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif']
        }
      }
    },
    plugins: []
  };

  const configContent = `module.exports = ${JSON.stringify(config, null, 2)};`;
  fs.writeFileSync(tailwindConfigPath, configContent);
}

/**
 * デザインシステムファイルを更新
 */
function updateDesignSystemFile(classes, components) {
  const designSystemPath = path.join(__dirname, '..', 'app', 'src', 'lib', 'design-system', 'index.ts');
  
  const content = `// 自動生成されたデザインシステム
// このファイルはFigma MCPによって自動生成されます

export const designTokens = {
  colors: ${JSON.stringify(classes.colors, null, 2)},
  spacing: ${JSON.stringify(classes.spacing, null, 2)},
  typography: ${JSON.stringify(classes.typography, null, 2)}
};

export const componentClasses = ${JSON.stringify(components, null, 2)};

// レスポンシブデザイン用のユーティリティ
export const responsive = {
  grid: {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  },
  text: {
    'heading-2xl': 'text-2xl md:text-4xl lg:text-6xl',
    'heading-xl': 'text-xl md:text-3xl lg:text-4xl',
    'heading-lg': 'text-lg md:text-2xl lg:text-3xl'
  }
};
`;

  fs.writeFileSync(designSystemPath, content);
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🎨 Figma MCP統合を開始します...');
    
    // ここでFigma MCPサーバーからデータを取得
    // 実際の実装では、MCPサーバーとの通信を行う
    const mockFigmaData = {
      colors: [
        { name: 'Primary', value: '#ec4899', description: 'メインカラー' },
        { name: 'Secondary', value: '#8b5cf6', description: 'セカンダリカラー' }
      ],
      spacing: [
        { name: 'Small', value: '0.5rem', description: '小さいスペース' },
        { name: 'Medium', value: '1rem', description: '中程度のスペース' },
        { name: 'Large', value: '2rem', description: '大きいスペース' }
      ],
      typography: [
        { name: 'Heading Large', fontSize: '2rem', fontWeight: '700', lineHeight: '1.2' },
        { name: 'Body Medium', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' }
      ]
    };

    const mockComponents = [
      {
        name: 'Button Primary',
        styles: {
          base: 'px-6 py-3 rounded-lg font-semibold transition-colors',
          variants: {
            primary: 'bg-pink-600 text-white hover:bg-pink-700',
            secondary: 'border border-pink-600 text-pink-600 hover:bg-pink-50'
          }
        }
      }
    ];

    // Tailwindクラスを生成
    const classes = generateTailwindClasses(mockFigmaData);
    const components = generateComponentClasses(mockComponents);

    // 設定ファイルを更新
    updateTailwindConfig(classes);
    updateDesignSystemFile(classes, components);

    console.log('✅ Figma MCP統合が完了しました！');
    console.log('📁 更新されたファイル:');
    console.log('  - app/tailwind.config.js');
    console.log('  - app/src/lib/design-system/index.ts');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプトを実行
if (require.main === module) {
  main();
}

module.exports = {
  generateTailwindClasses,
  generateComponentClasses,
  updateTailwindConfig,
  updateDesignSystemFile
};
