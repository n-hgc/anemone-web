#!/usr/bin/env node

/**
 * Figmaデザイン抽出スクリプト
 * Figma MCPサーバーからデザインデータを取得し、トップページ用のコンポーネントを生成
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Figma MCPサーバーからデザインデータを取得
 */
async function getFigmaDesignData() {
  return new Promise((resolve, reject) => {
    // 設定ファイルからFigmaファイルURLを読み込み
    const configPath = path.join(__dirname, '..', 'design-system-config.json');
    let figmaFileUrl = 'https://www.figma.com/design/kRVC29kld4299v1Gyby1Hg/anemone-v1?t=2Ztg5fZZcsdBZleC-0';
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.figma && config.figma.fileUrl) {
        figmaFileUrl = config.figma.fileUrl;
      }
    } catch (error) {
      console.log('設定ファイルの読み込みに失敗、デフォルトURLを使用します');
    }

    const options = {
      hostname: '127.0.0.1',
      port: 3845,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const postData = JSON.stringify({
      fileUrl: figmaFileUrl,
      action: 'getDesignData'
    });

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (data && data.trim()) {
            const result = JSON.parse(data);
            console.log('Figma MCPサーバーからデザインデータを取得しました');
            resolve(result);
          } else {
            console.log('Figma MCPサーバーからのデータが空、モックデータを使用します');
            resolve(generateMockDesignData());
          }
        } catch (error) {
          console.log('Figma MCPサーバーからのデータ解析に失敗、モックデータを使用します:', error.message);
          resolve(generateMockDesignData());
        }
      });
    });

    req.on('error', (error) => {
      console.log('Figma MCPサーバーに接続できません、モックデータを使用します:', error.message);
      resolve(generateMockDesignData());
    });

    req.setTimeout(10000, () => {
      console.log('タイムアウト: モックデータを使用します');
      resolve(generateMockDesignData());
    });

    req.write(postData);
    req.end();
  });
}

/**
 * モックデザインデータを生成（Figmaのデザインに基づく）
 */
function generateMockDesignData() {
  return {
    colors: {
      primary: '#E91E63', // より鮮やかなピンク
      secondary: '#9C27B0', // より鮮やかなパープル
      accent: '#FF4081', // アクセントピンク
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121'
      },
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336'
    },
    typography: {
      hero: {
        fontSize: '3.5rem',
        fontWeight: '900',
        lineHeight: '1.1',
        letterSpacing: '-0.025em'
      },
      heading: {
        fontSize: '2.25rem',
        fontWeight: '800',
        lineHeight: '1.2'
      },
      subheading: {
        fontSize: '1.5rem',
        fontWeight: '700',
        lineHeight: '1.3'
      },
      body: {
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.6'
      },
      caption: {
        fontSize: '0.875rem',
        fontWeight: '500',
        lineHeight: '1.4'
      }
    },
    spacing: {
      section: '5rem',
      container: '1.5rem',
      card: '1.5rem',
      button: '0.75rem 1.5rem'
    },
    components: {
      hero: {
        background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 50%, #673AB7 100%)',
        padding: '6rem 0',
        textAlign: 'center',
        position: 'relative'
      },
      card: {
        background: '#ffffff',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        hover: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      },
      button: {
        primary: {
          background: '#E91E63',
          color: '#ffffff',
          padding: '0.875rem 2rem',
          borderRadius: '0.75rem',
          fontWeight: '700',
          hover: '#C2185B',
          transition: 'all 0.3s ease'
        },
        secondary: {
          background: 'transparent',
          color: '#E91E63',
          border: '2px solid #E91E63',
          padding: '0.875rem 2rem',
          borderRadius: '0.75rem',
          fontWeight: '700',
          hover: '#FCE4EC',
          transition: 'all 0.3s ease'
        },
        outline: {
          background: 'transparent',
          color: '#ffffff',
          border: '2px solid #ffffff',
          padding: '0.875rem 2rem',
          borderRadius: '0.75rem',
          fontWeight: '700',
          hover: '#ffffff',
          hoverColor: '#E91E63',
          transition: 'all 0.3s ease'
        }
      },
      input: {
        background: '#ffffff',
        border: '2px solid #e0e0e0',
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        focus: '#E91E63',
        transition: 'all 0.3s ease'
      }
    },
    layout: {
      maxWidth: '1200px',
      containerPadding: '1.5rem',
      gridGap: '2rem'
    }
  };
}

/**
 * デザインデータを安全に取得する
 */
function getSafeDesignData(designData) {
  const defaultData = generateMockDesignData();
  
  return {
    colors: {
      primary: designData?.colors?.primary || defaultData.colors.primary,
      secondary: designData?.colors?.secondary || defaultData.colors.secondary,
      accent: designData?.colors?.accent || defaultData.colors.accent,
      neutral: designData?.colors?.neutral || defaultData.colors.neutral
    },
    typography: {
      hero: designData?.typography?.hero || defaultData.typography.hero,
      heading: designData?.typography?.heading || defaultData.typography.heading,
      subheading: designData?.typography?.subheading || defaultData.typography.subheading,
      body: designData?.typography?.body || defaultData.typography.body
    },
    spacing: designData?.spacing || defaultData.spacing,
    components: designData?.components || defaultData.components
  };
}

/**
 * トップページ用のAstroコンポーネントを生成
 */
function generateTopPageComponent(designData) {
  return `---
import Layout from '../layouts/Layout.astro';
import SalonCard from '../components/SalonCard.astro';
import NewsCard from '../components/NewsCard.astro';
import LocatorFilters from '../components/LocatorFilters.astro';
import type { LegacySalon, News, Prefecture } from '../types';

// モックデータをインポート
import salonsData from '../data/salons.json';
import newsData from '../data/news.json';
import prefecturesData from '../data/prefectures.json';

const salons: LegacySalon[] = salonsData;
const news: News[] = newsData;
const prefectures: Prefecture[] = prefecturesData;

// 最新のニュース3件を取得
const latestNews = news.slice(0, 3);

// 店舗一覧のJSON-LDを生成
const salonJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": salons.map((salon, index) => ({
    "@type": "HairSalon",
    "position": index + 1,
    "name": \`アネモネ \${salon.name}\`,
    "url": \`https://anemone-salon.com/salon/\${salon.id}\`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": salon.address,
      "addressRegion": salon.prefecture,
      "addressCountry": "JP"
    },
    "telephone": salon.tel
  }))
};
---

<Layout 
  title="アネモネサロン - 美容室・ヘアサロン"
  description="アネモネサロンは全国展開する美容室・ヘアサロンです。お客様一人ひとりに合ったスタイルをご提案いたします。"
  image="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop"
  jsonLd={JSON.stringify(salonJsonLd)}
>
  <!-- ヒーローセクション -->
  <section class="relative overflow-hidden" style="background: ${designData.components.hero.background}; padding: ${designData.components.hero.padding}; text-align: ${designData.components.hero.textAlign};">
    <div class="absolute inset-0 bg-black opacity-10"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-white mb-6" style="font-size: ${designData.typography.hero.fontSize}; font-weight: ${designData.typography.hero.fontWeight}; line-height: ${designData.typography.hero.lineHeight}; letter-spacing: ${designData.typography.hero.letterSpacing};">
          アネモネサロン
        </h1>
        <p class="text-white text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style="font-size: ${designData.typography.body.fontSize}; font-weight: ${designData.typography.body.fontWeight}; line-height: ${designData.typography.body.lineHeight};">
          あなたにぴったりのスタイルを見つけませんか？<br>
          全国100店舗でお客様をお待ちしています
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#salons" 
            class="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
            style="background: ${designData.components.button.primary.background}; color: ${designData.components.button.primary.color}; padding: ${designData.components.button.primary.padding}; border-radius: ${designData.components.button.primary.borderRadius}; font-weight: ${designData.components.button.primary.fontWeight};"
            onmouseover="this.style.background='${designData.components.button.primary.hover}'"
            onmouseout="this.style.background='${designData.components.button.primary.background}'"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            店舗を探す
          </a>
          <a 
            href="/recruit" 
            class="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            style="background: ${designData.components.button.secondary.background}; color: ${designData.components.button.secondary.color}; border: ${designData.components.button.secondary.border}; padding: ${designData.components.button.secondary.padding}; border-radius: ${designData.components.button.secondary.borderRadius}; font-weight: ${designData.components.button.secondary.fontWeight};"
            onmouseover="this.style.background='${designData.components.button.secondary.hover}'"
            onmouseout="this.style.background='${designData.components.button.secondary.background}'"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            採用情報
          </a>
        </div>
      </div>
    </div>
    
    <!-- 装飾的な要素 -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
      <div class="absolute top-40 right-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      <div class="absolute bottom-20 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
    </div>
  </section>

  <!-- 地域フィルター -->
  <section class="py-16" style="background: ${designData.colors.neutral[50]};">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-gray-900 mb-4" style="font-size: ${designData.typography.heading.fontSize}; font-weight: ${designData.typography.heading.fontWeight}; line-height: ${designData.typography.heading.lineHeight};">
          地域で探す
        </h2>
        <p class="text-gray-600" style="font-size: ${designData.typography.body.fontSize}; font-weight: ${designData.typography.body.fontWeight}; line-height: ${designData.typography.body.lineHeight};">
          お住まいの地域から最寄りの店舗を見つけましょう
        </p>
      </div>
      <LocatorFilters prefectures={prefectures} />
    </div>
  </section>

  <!-- 店舗一覧 -->
  <section id="salons" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-gray-900 mb-6" style="font-size: ${designData.typography.heading.fontSize}; font-weight: ${designData.typography.heading.fontWeight}; line-height: ${designData.typography.heading.lineHeight};">
          全国の店舗
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto" style="font-size: ${designData.typography.body.fontSize}; font-weight: ${designData.typography.body.fontWeight}; line-height: ${designData.typography.body.lineHeight};">
          お客様一人ひとりに合ったスタイルをご提案する美容室・ヘアサロンです
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {salons.map((salon) => (
          <div class="group" style="background: ${designData.components.card.background}; border-radius: ${designData.components.card.borderRadius}; padding: ${designData.components.card.padding}; box-shadow: ${designData.components.card.boxShadow}; transition: all 0.3s ease;">
            <div class="aspect-w-16 aspect-h-9 mb-6 overflow-hidden rounded-lg">
              {salon.photos.length > 0 && (
                <img 
                  src={salon.photos[0]} 
                  alt={\`\${salon.name}の外観\`}
                  class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                {salon.name}
              </h3>
              
              <div class="space-y-2 text-gray-600">
                <p class="flex items-center text-sm">
                  <svg class="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {salon.address}
                </p>
                
                <p class="flex items-center text-sm">
                  <svg class="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <a href={\`tel:\${salon.tel}\`} class="hover:text-pink-600 transition-colors">
                    {salon.tel}
                  </a>
                </p>
                
                <p class="flex items-center text-sm">
                  <svg class="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {salon.hours}
                </p>
              </div>
              
              <div class="flex flex-wrap gap-2">
                {salon.facilities.map((facility) => (
                  <span class="px-3 py-1 bg-pink-100 text-pink-800 text-xs rounded-full font-medium">
                    {facility}
                  </span>
                ))}
              </div>
              
              <div class="flex space-x-3 pt-4">
                <a 
                  href={\`/salon/\${salon.id}\`}
                  class="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  style="background: ${designData.components.button.primary.background}; color: ${designData.components.button.primary.color}; border-radius: ${designData.components.button.primary.borderRadius}; font-weight: ${designData.components.button.primary.fontWeight};"
                  onmouseover="this.style.background='${designData.components.button.primary.hover}'"
                  onmouseout="this.style.background='${designData.components.button.primary.background}'"
                >
                  詳細を見る
                </a>
                {salon.reservation_url && (
                  <a 
                    href={salon.reservation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                    style="background: ${designData.components.button.secondary.background}; color: ${designData.components.button.secondary.color}; border: ${designData.components.button.secondary.border}; border-radius: ${designData.components.button.secondary.borderRadius}; font-weight: ${designData.components.button.secondary.fontWeight};"
                    onmouseover="this.style.background='${designData.components.button.secondary.hover}'"
                    onmouseout="this.style.background='${designData.components.button.secondary.background}'"
                  >
                    予約する
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- 最新ニュース -->
  <section class="py-20" style="background: ${designData.colors.neutral[50]};">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-gray-900 mb-6" style="font-size: ${designData.typography.heading.fontSize}; font-weight: ${designData.typography.heading.fontWeight}; line-height: ${designData.typography.heading.lineHeight};">
          最新ニュース
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto" style="font-size: ${designData.typography.body.fontSize}; font-weight: ${designData.typography.body.fontWeight}; line-height: ${designData.typography.body.lineHeight};">
          サロンの最新情報やお知らせをお届けします
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {latestNews.map((newsItem, index) => (
          <div class="group" style="background: ${designData.components.card.background}; border-radius: ${designData.components.card.borderRadius}; padding: ${designData.components.card.padding}; box-shadow: ${designData.components.card.boxShadow}; transition: all 0.3s ease;">
            {newsItem.featured_image && (
              <div class="aspect-w-16 aspect-h-9 mb-6 overflow-hidden rounded-lg">
                <img 
                  src={newsItem.featured_image} 
                  alt={newsItem.title}
                  class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <time class="text-sm text-gray-500" datetime={newsItem.date}>
                  {new Date(newsItem.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                {newsItem.categories.length > 0 && (
                  <span class="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full font-medium">
                    {newsItem.categories[0]}
                  </span>
                )}
              </div>
              
              <h3 class="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                <a href={\`/news/\${newsItem.id}\`} class="hover:text-pink-600">
                  {newsItem.title}
                </a>
              </h3>
              
              <p class="text-gray-600 line-clamp-3" style="font-size: ${designData.typography.body.fontSize}; font-weight: ${designData.typography.body.fontWeight}; line-height: ${designData.typography.body.lineHeight};">
                {newsItem.excerpt}
              </p>
              
              <div class="flex items-center justify-between pt-4">
                <a 
                  href={\`/news/\${newsItem.id}\`}
                  class="text-pink-600 hover:text-pink-700 font-semibold flex items-center"
                >
                  続きを読む
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
                
                {newsItem.tags.length > 0 && (
                  <div class="flex flex-wrap gap-1">
                    {newsItem.tags.slice(0, 2).map((tag) => (
                      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div class="text-center mt-12">
        <a 
          href="/news" 
          class="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          style="background: ${designData.components.button.primary.background}; color: ${designData.components.button.primary.color}; padding: ${designData.components.button.primary.padding}; border-radius: ${designData.components.button.primary.borderRadius}; font-weight: ${designData.components.button.primary.fontWeight};"
          onmouseover="this.style.background='${designData.components.button.primary.hover}'"
          onmouseout="this.style.background='${designData.components.button.primary.background}'"
        >
          すべてのニュースを見る
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
    </div>
  </section>

  <!-- CTAセクション -->
  <section class="py-20" style="background: ${designData.components.hero.background};">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-white mb-6" style="font-size: ${designData.typography.heading.fontSize}; font-weight: ${designData.typography.heading.fontWeight}; line-height: ${designData.typography.heading.lineHeight};">
        まずはお気軽にご相談ください
      </h2>
      <p class="text-white text-xl mb-8 max-w-2xl mx-auto" style="font-size: ${designData.typography.body.fontSize}; font-weight: ${designData.typography.body.fontWeight}; line-height: ${designData.typography.body.lineHeight};">
        お客様一人ひとりに合ったスタイルをご提案いたします
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="tel:03-1234-5678" 
          class="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          style="background: ${designData.components.button.primary.background}; color: ${designData.components.button.primary.color}; padding: ${designData.components.button.primary.padding}; border-radius: ${designData.components.button.primary.borderRadius}; font-weight: ${designData.components.button.primary.fontWeight};"
          onmouseover="this.style.background='${designData.components.button.primary.hover}'"
          onmouseout="this.style.background='${designData.components.button.primary.background}'"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          お電話で予約
        </a>
        <a 
          href="/recruit" 
          class="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          style="background: ${designData.components.button.secondary.background}; color: ${designData.components.button.secondary.color}; border: ${designData.components.button.secondary.border}; padding: ${designData.components.button.secondary.padding}; border-radius: ${designData.components.button.secondary.borderRadius}; font-weight: ${designData.components.button.secondary.fontWeight};"
          onmouseover="this.style.background='${designData.components.button.secondary.hover}'"
          onmouseout="this.style.background='${designData.components.button.secondary.background}'"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          スタッフ募集
        </a>
      </div>
    </div>
  </section>
</Layout>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>`;
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🎨 Figmaデザイン抽出を開始します...');
    
    // Figmaからデザインデータを取得
    const rawDesignData = await getFigmaDesignData();
    console.log('✅ デザインデータを取得しました');
    
    // 安全なデザインデータを取得
    const designData = getSafeDesignData(rawDesignData);
    console.log('✅ デザインデータを安全に処理しました');
    
    // トップページコンポーネントを生成
    const topPageComponent = generateTopPageComponent(designData);
    
    // ファイルに保存
    const outputPath = path.join(__dirname, '..', 'app', 'src', 'pages', 'index.astro');
    fs.writeFileSync(outputPath, topPageComponent);
    
    console.log('✅ トップページを更新しました');
    console.log('📁 更新されたファイル: app/src/pages/index.astro');
    
    // デザインシステムファイルも更新
    const designSystemPath = path.join(__dirname, '..', 'app', 'src', 'lib', 'design-system', 'index.ts');
    const designSystemContent = `// 自動生成されたデザインシステム
// このファイルはFigma MCPによって自動生成されます

export const designTokens = {
  colors: {
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '${designData.colors.primary}',
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
      500: '${designData.colors.secondary}',
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
      500: '${designData.colors.accent}',
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
      fontSize: '${designData.typography.hero.fontSize}',
      fontWeight: '${designData.typography.hero.fontWeight}',
      lineHeight: '${designData.typography.hero.lineHeight}',
      letterSpacing: '${designData.typography.hero.letterSpacing}'
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
`;

    fs.writeFileSync(designSystemPath, designSystemContent);
    console.log('✅ デザインシステムファイルを更新しました');
    
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
  getFigmaDesignData,
  generateTopPageComponent
};
