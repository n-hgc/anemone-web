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
 * 設定ファイルからTailwindクラスを生成
 */
function generateTailwindClasses() {
  const designSystem = config.figma.designSystem;
  
  return {
    colors: {
      ...designSystem.colors.text,
      ...designSystem.colors.background,
      ...designSystem.colors.border
    },
    spacing: {
      small: {
        value: '0.5rem',
        description: '小さいスペース'
      },
      medium: {
        value: '1rem',
        description: '中程度のスペース'
      },
      large: {
        value: '2rem',
        description: '大きいスペース'
      }
    },
    typography: {
      'h2-pc': {
        fontSize: designSystem.typography.fontSize.h2_pc,
        fontWeight: designSystem.typography.fontWeight.medium,
        lineHeight: designSystem.typography.lineHeight.tight,
        fontFamily: designSystem.typography.fontFamily.yumincho,
        description: 'PC用H2見出し'
      },
      'h3-pc': {
        fontSize: designSystem.typography.fontSize.h3_pc,
        fontWeight: designSystem.typography.fontWeight.medium,
        lineHeight: designSystem.typography.lineHeight.normal,
        fontFamily: designSystem.typography.fontFamily.yumincho,
        description: 'PC用H3見出し'
      },
      'p-pc': {
        fontSize: designSystem.typography.fontSize.p_pc,
        fontWeight: designSystem.typography.fontWeight.regular,
        lineHeight: designSystem.typography.lineHeight.normal,
        fontFamily: designSystem.typography.fontFamily.zenkaku,
        description: 'PC用本文'
      },
      'h2-sp': {
        fontSize: designSystem.typography.fontSize.h2_sp,
        fontWeight: designSystem.typography.fontWeight.medium,
        lineHeight: designSystem.typography.lineHeight.tight,
        fontFamily: designSystem.typography.fontFamily.yumincho,
        description: 'SP用H2見出し'
      },
      'h3-sp': {
        fontSize: designSystem.typography.fontSize.h3_sp,
        fontWeight: designSystem.typography.fontWeight.medium,
        lineHeight: designSystem.typography.lineHeight.normal,
        fontFamily: designSystem.typography.fontFamily.yumincho,
        description: 'SP用H3見出し'
      },
      'p-sp': {
        fontSize: designSystem.typography.fontSize.p_sp,
        fontWeight: designSystem.typography.fontWeight.regular,
        lineHeight: designSystem.typography.lineHeight.normal,
        fontFamily: designSystem.typography.fontFamily.zenkaku,
        description: 'SP用本文'
      }
    }
  };
}

/**
 * コンポーネントクラスを生成
 */
function generateComponentClasses() {
  const designSystem = config.figma.designSystem;
  
  return {
    button: {
      primary: designSystem.components.button.primary,
      secondary: designSystem.components.button.secondary
    },
    card: {
      base: designSystem.components.card
    },
    input: {
      base: designSystem.components.input
    }
  };
}

/**
 * Tailwind設定ファイルを更新
 */
function updateTailwindConfig(classes) {
  const tailwindConfigPath = path.join(__dirname, '..', 'app', 'tailwind.config.js');
  
  const tailwindConfig = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          // カスタムカラー
          black: "#3D3D3D",
          grey_medium: "#A7A7A7",
          grey_light: "#CFCFCF",
          brown_dark: "#69552E",
          brown_light: "#B8AA8C",
          white: "#FFFFFF",
          brown: "#69552E",
          beige: "#FAF4E8",
          // ネストしたカラー
          text: config.tailwind.customColors.text,
          background: config.tailwind.customColors.background,
          border: config.tailwind.customColors.border
        },
        spacing: {
          small: "0.5rem",
          medium: "1rem",
          large: "2rem"
        },
        fontSize: {
          'h2-pc': ['64px', { lineHeight: '100%', fontWeight: '500' }],
          'h3-pc': ['24px', { lineHeight: '150%', fontWeight: '500' }],
          'p-pc': ['16px', { lineHeight: '150%', fontWeight: '400' }],
          'h2-sp': ['36px', { lineHeight: '100%', fontWeight: '500' }],
          'h3-sp': ['20px', { lineHeight: '150%', fontWeight: '500' }],
          'p-sp': ['16px', { lineHeight: '150%', fontWeight: '400' }]
        },
        fontFamily: {
          yumincho: ['YuMincho', 'serif'],
          zenkaku: ['ZenKakuGothicNew', 'sans-serif']
        },
        screens: {
          'pc': '768px',
          'sp': '767px'
        }
      }
    },
    plugins: []
  };

  const configContent = `module.exports = ${JSON.stringify(tailwindConfig, null, 2)};`;
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
    '2': 'grid-cols-1 pc:grid-cols-2',
    '3': 'grid-cols-1 pc:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 pc:grid-cols-2 lg:grid-cols-4'
  },
  text: {
    'h2': 'text-4xl pc:text-6xl font-yumincho font-medium leading-tight',
    'h3': 'text-xl pc:text-2xl font-yumincho font-medium leading-normal',
    'p': 'text-base font-zenkaku font-normal leading-normal'
  },
  spacing: {
    'section': 'py-8 pc:py-16',
    'container': 'px-4 sm:px-6 lg:px-8'
  }
};

// ユーティリティ関数
export const createComponentClass = (component: string, variant?: string) => {
  const base = componentClasses[component]?.base || '';
  const variantClass = variant ? componentClasses[component]?.[variant] : '';
  
  return [base, variantClass].filter(Boolean).join(' ');
};

// カラーユーティリティ
export const getColor = (color: string) => {
  return designTokens.colors[color]?.value || color;
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
    
    // 設定ファイルからクラスを生成
    const classes = generateTailwindClasses();
    const components = generateComponentClasses();

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
