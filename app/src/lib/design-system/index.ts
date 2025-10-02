// 自動生成されたデザインシステム
// このファイルはFigma MCPによって自動生成されます

export const designTokens = {
  colors: {
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#E91E63',
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
      500: '#9C27B0',
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
      500: '#FF4081',
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
    hero: {
      fontSize: '3.5rem',
      fontWeight: '900',
      lineHeight: '1.1',
      letterSpacing: '-0.025em'
    },
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
