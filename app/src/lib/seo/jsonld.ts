import type { LegacySalon, News } from '../../types';

// JSON-LDを生成するユーティリティ関数
export const jsonld = (obj: object) => 
  `\n<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

// 店舗用のJSON-LDを生成
export const generateSalonJsonLd = (salon: LegacySalon) => {
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `https://anemone-salon.com/salon/${salon.id}`,
    "name": `アネモネ ${salon.name}`,
    "image": salon.photos,
    "url": `https://anemone-salon.com/salon/${salon.id}`,
    "telephone": salon.tel,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": salon.address,
      "addressRegion": salon.prefecture,
      "addressCountry": "JP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": salon.geo.lat,
      "longitude": salon.geo.lng
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "10:00",
        "closes": "20:00"
      }
    ],
    "potentialAction": {
      "@type": "ReserveAction",
      "target": salon.reservation_url
    }
  };
};

// ニュース用のJSON-LDを生成
export const generateNewsJsonLd = (news: News) => {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.title,
    "datePublished": news.date,
    "dateModified": news.date,
    "author": {
      "@type": "Organization",
      "name": "Anemone"
    },
    "mainEntityOfPage": `https://anemone-salon.com/news/${news.id}`,
    "image": news.featured_image ? [news.featured_image] : []
  };
};

// 採用ページ用のJSON-LDを生成
export const generateRecruitJsonLd = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "採用情報 - アネモネサロン",
    "description": "アネモネサロンの採用情報ページです。美容師・スタイリストの求人情報をご覧いただけます。",
    "url": "https://anemone-salon.com/recruit"
  };
};
