// 自動生成されたデザインシステム
// このファイルはFigma MCPによって自動生成されます

export const designTokens = {
  colors: {
  "black": "#3D3D3D",
  "grey_medium": "#A7A7A7",
  "grey_light": "#CFCFCF",
  "brown_dark": "#69552E",
  "brown_light": "#B8AA8C",
  "white": "#FFFFFF",
  "brown": "#69552E",
  "beige": "#FAF4E8"
},
  spacing: {
  "small": {
    "value": "0.5rem",
    "description": "小さいスペース"
  },
  "medium": {
    "value": "1rem",
    "description": "中程度のスペース"
  },
  "large": {
    "value": "2rem",
    "description": "大きいスペース"
  }
},
  typography: {
  "h2-pc": {
    "fontSize": "64px",
    "fontWeight": "500",
    "lineHeight": "100%",
    "fontFamily": [
      "YuMincho",
      "serif"
    ],
    "description": "PC用H2見出し"
  },
  "h3-pc": {
    "fontSize": "24px",
    "fontWeight": "500",
    "lineHeight": "150%",
    "fontFamily": [
      "YuMincho",
      "serif"
    ],
    "description": "PC用H3見出し"
  },
  "p-pc": {
    "fontSize": "16px",
    "fontWeight": "400",
    "lineHeight": "150%",
    "fontFamily": [
      "ZenKakuGothicNew",
      "sans-serif"
    ],
    "description": "PC用本文"
  },
  "h2-sp": {
    "fontSize": "36px",
    "fontWeight": "500",
    "lineHeight": "100%",
    "fontFamily": [
      "YuMincho",
      "serif"
    ],
    "description": "SP用H2見出し"
  },
  "h3-sp": {
    "fontSize": "20px",
    "fontWeight": "500",
    "lineHeight": "150%",
    "fontFamily": [
      "YuMincho",
      "serif"
    ],
    "description": "SP用H3見出し"
  },
  "p-sp": {
    "fontSize": "16px",
    "fontWeight": "400",
    "lineHeight": "150%",
    "fontFamily": [
      "ZenKakuGothicNew",
      "sans-serif"
    ],
    "description": "SP用本文"
  }
}
};

export const componentClasses = {
  "button": {
    "primary": "bg-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-brown_dark transition-colors",
    "secondary": "border border-brown text-brown px-6 py-3 rounded-lg font-medium hover:bg-beige transition-colors"
  },
  "card": {
    "base": "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  },
  "input": {
    "base": "w-full px-3 py-2 border border-grey_light rounded-md focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown"
  }
};

// レスポンシブデザイン用のユーティリティ
export const responsive = {
  grid: {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 pc:grid-cols-2',
    '3': 'grid-cols-1 pc:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 pc:grid-cols-2 lg:grid-cols-4'
  },
  text: {
    'h2': 'text-h2-sp pc:text-h2-pc font-yumincho font-medium',
    'h3': 'text-h3-sp pc:text-h3-pc font-yumincho font-medium',
    'p': 'text-p-sp pc:text-p-pc font-zenkaku font-normal'
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
