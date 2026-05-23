// Node script: Fetch hairstyle page (ACF) from WordPress and generate flat JSON
// Output: app/public/data/hairstyles.index.json
//
// メディアは ?include=<id1>,<id2>,... で一括取得し、N+1 リクエストを廃止。
// 370件 → 約 370 calls だったものを 5 calls 前後に削減。

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchWithHeaders(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      const json = await res.json();
      return { data: json, headers: res.headers };
    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`Fetch attempt ${attempt}/${retries} failed for ${url}: ${e?.message || e}. Retrying...`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

/**
 * 大量の media ID を ?include= で 100件単位にまとめて取得し、Mapを返す。
 */
async function fetchMediaMap(baseUrl, ids) {
  const map = new Map();
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  const chunkSize = 100;
  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize);
    const url = `${baseUrl}/wp-json/wp/v2/media?include=${chunk.join(',')}&per_page=${chunk.length}&orderby=include`;
    const { data } = await fetchWithHeaders(url);
    if (!Array.isArray(data)) {
      throw new Error('Invalid media data format');
    }
    for (const m of data) {
      map.set(m.id, {
        source_url: m.source_url,
        alt_text: m.alt_text,
        title: m.title?.rendered
      });
    }
  }
  return map;
}

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';
  const pageUrl = `${WP_BASE}/wp-json/wp/v2/pages?slug=hairstyle`;

  // 1. hairstyle ページの ACF を取得（1 call）
  const { data: pages } = await fetchWithHeaders(pageUrl);
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('hairstyle page not found');
  }
  const page = pages[0];
  const hairstyles = (page?.acf?.hairstyles ?? []);

  // 2. ACFを走査して使用される媒体ID群と hairType の関連を作る
  const entries = []; // { id, hairType }
  const seen = new Set();
  for (const row of hairstyles) {
    if (!row || typeof row !== 'object') continue;
    for (let i = 1; i <= 5; i++) {
      const group = row[`group-${i}`];
      if (!group || !group['image'] || group['image'] === false) continue;
      const imageId = group['image'];
      const hairType = group['hair-type'];
      if (!imageId || !hairType) continue;
      if (seen.has(imageId)) continue;
      seen.add(imageId);
      entries.push({ id: imageId, hairType });
    }
  }
  console.log(`Found ${entries.length} unique hairstyle image refs`);

  // 3. media を一括取得（100件/call、370件なら 4 calls）
  const ids = entries.map(e => e.id);
  console.log(`Fetching ${ids.length} media items in batched include= requests...`);
  const mediaMap = await fetchMediaMap(WP_BASE, ids);
  console.log(`Resolved ${mediaMap.size} media items`);

  // 4. 結合
  const items = [];
  for (const { id, hairType } of entries) {
    const media = mediaMap.get(id);
    if (!media?.source_url) continue;
    items.push({
      id,
      hairType,
      imageUrl: media.source_url,
      alt: media.alt_text || media.title || ''
    });
  }

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'hairstyles.index.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} items to ${outFile}`);
}

main().catch(err => {
  const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app', 'public', 'data', 'hairstyles.index.json');
  if (fs.existsSync(outFile)) {
    console.warn(`Failed to fetch hairstyles data: ${err?.message || err}`);
    console.warn(`Using existing ${outFile} as fallback.`);
  } else {
    console.error(err);
    process.exit(1);
  }
});
