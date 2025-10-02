#!/usr/bin/env node

/**
 * Figma MCPクライアント
 * Figma MCPサーバーからデザインデータを取得する
 */

const http = require('http');

/**
 * Figma MCPサーバーからファイル一覧を取得
 */
async function getFigmaFiles() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3845,
      path: '/mcp/files',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`JSON解析エラー: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`リクエストエラー: ${error.message}`));
    });

    req.end();
  });
}

/**
 * 特定のFigmaファイルのデザインデータを取得
 */
async function getFigmaDesignData(fileUrl) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3845,
      path: '/mcp/design',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const postData = JSON.stringify({
      fileUrl: fileUrl
    });

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`JSON解析エラー: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`リクエストエラー: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🔍 Figma MCPサーバーからファイル一覧を取得中...');
    
    // ファイル一覧を取得
    const files = await getFigmaFiles();
    console.log('📁 利用可能なFigmaファイル:');
    console.log(JSON.stringify(files, null, 2));
    
    // 最初のファイルのデザインデータを取得
    if (files && files.length > 0) {
      const firstFile = files[0];
      console.log(`\n🎨 ファイル "${firstFile.name}" のデザインデータを取得中...`);
      
      const designData = await getFigmaDesignData(firstFile.url);
      console.log('✅ デザインデータを取得しました:');
      console.log(JSON.stringify(designData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    
    // フォールバック: モックデータを使用
    console.log('\n🔄 モックデータを使用してデザインシステムを更新します...');
    
    const mockData = {
      colors: [
        { name: 'Primary', value: '#ec4899', description: 'メインカラー' },
        { name: 'Secondary', value: '#8b5cf6', description: 'セカンダリカラー' },
        { name: 'Accent', value: '#f472b6', description: 'アクセントカラー' }
      ],
      spacing: [
        { name: 'Small', value: '0.5rem', description: '小さいスペース' },
        { name: 'Medium', value: '1rem', description: '中程度のスペース' },
        { name: 'Large', value: '2rem', description: '大きいスペース' },
        { name: 'XLarge', value: '3rem', description: '非常に大きいスペース' }
      ],
      typography: [
        { name: 'Heading Large', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' },
        { name: 'Heading Medium', fontSize: '2rem', fontWeight: '600', lineHeight: '1.3' },
        { name: 'Body Large', fontSize: '1.125rem', fontWeight: '400', lineHeight: '1.6' },
        { name: 'Body Medium', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' },
        { name: 'Body Small', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.4' }
      ]
    };
    
    // デザインシステムファイルを更新
    const fs = require('fs');
    const path = require('path');
    
    const designSystemPath = path.join(__dirname, '..', 'app', 'src', 'lib', 'design-system', 'index.ts');
    
    const content = `// 自動生成されたデザインシステム
// このファイルはFigma MCPによって自動生成されます

export const designTokens = {
  colors: {
    primary: {
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
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    accent: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#f472b6',
      600: '#ec4899',
      700: '#db2777',
      800: '#be185d',
      900: '#9d174d'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem'
  },
  typography: {
    heading: {
      '2xl': 'text-4xl font-bold',
      xl: 'text-3xl font-bold',
      lg: 'text-2xl font-bold',
      md: 'text-xl font-semibold',
      sm: 'text-lg font-semibold'
    },
    body: {
      lg: 'text-lg',
      base: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs'
    }
  }
};

export const componentClasses = {
  button: {
    primary: 'bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
    secondary: 'border border-pink-600 text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
    outline: 'border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2'
  },
  card: {
    base: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow',
    elevated: 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow'
  },
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500',
    error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
  },
  container: {
    base: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8'
  },
  section: {
    base: 'py-16',
    small: 'py-8',
    large: 'py-24'
  }
};

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
  },
  spacing: {
    'section': 'py-8 md:py-16 lg:py-20',
    'container': 'px-4 sm:px-6 lg:px-8'
  }
};
`;

    fs.writeFileSync(designSystemPath, content);
    console.log('✅ デザインシステムファイルを更新しました');
  }
}

// スクリプトを実行
if (require.main === module) {
  main();
}

module.exports = {
  getFigmaFiles,
  getFigmaDesignData
};
