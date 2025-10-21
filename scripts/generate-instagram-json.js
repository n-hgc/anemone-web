// Node script: Fetch Instagram API data from WordPress and generate JSON
// Output: app/public/data/instagram.index.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchJson(url, init = {}) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }, ...init });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';
  const instagramUrl = `${WP_BASE}/wp-json/wp/v2/instagram_api?per_page=100`;

  console.log('Fetching Instagram data from:', instagramUrl);
  
  const apiItems = await fetchJson(instagramUrl);
  if (!Array.isArray(apiItems)) {
    throw new Error('Invalid Instagram API response format');
  }

  console.log(`Found ${apiItems.length} Instagram items`);

  const items = [];

  for (const apiItem of apiItems) {
    try {
      // メディア情報を取得
      const mediaUrl = `${WP_BASE}/wp-json/wp/v2/media/${apiItem.featured_media}`;
      const media = await fetchJson(mediaUrl);
      
      const item = {
        id: apiItem.id,
        title: apiItem.title.rendered,
        slug: apiItem.slug,
        imageUrl: media?.source_url || '',
        instagramUrl: apiItem.acf?.url || '',
        date: apiItem.date_gmt,
        featured_media_id: apiItem.featured_media,
        alt: media?.alt_text || media?.title?.rendered || apiItem.title.rendered
      };

      items.push(item);
    } catch (e) {
      console.warn('Failed to fetch media for Instagram item', apiItem.id, e?.message || e);
      
      // メディア取得に失敗した場合でも基本情報は保存
      const item = {
        id: apiItem.id,
        title: apiItem.title.rendered,
        slug: apiItem.slug,
        imageUrl: '',
        instagramUrl: apiItem.acf?.url || '',
        date: apiItem.date_gmt,
        featured_media_id: apiItem.featured_media,
        alt: apiItem.title.rendered
      };

      items.push(item);
    }
  }

  // 日付でソート（新しい順）
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'instagram.index.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} Instagram items to ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
