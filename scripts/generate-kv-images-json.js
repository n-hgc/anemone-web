// Node script: Fetch KV (key visual) images from WordPress and generate flat JSON
// Output: app/public/data/kv-images.json
//
// CPT: kv_image  (タイトル + アイキャッチ + ACF caption/alt_text + page-attributes order)
// Taxonomy: kv_location (表示場所: top-hero / recruit-hero / top-hairmake など)
// CPT が未登録 (404) の場合は空配列で出力 (フロント側のフォールバックに任せる)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchJsonOrNull(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`Fetch attempt ${attempt}/${retries} failed for ${url}: ${e?.message || e}. Retrying...`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';
  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'kv-images.json');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Fetching KV images from WordPress...');

  const locationsRaw = await fetchJsonOrNull(`${WP_BASE}/wp-json/wp/v2/kv_location?per_page=100`);
  if (locationsRaw === null) {
    console.warn('kv_location taxonomy not found (WP-side not set up yet). Writing empty kv-images.json.');
    fs.writeFileSync(outFile, '[]\n', 'utf-8');
    return;
  }
  const locationMap = new Map();
  for (const t of locationsRaw) {
    locationMap.set(t.id, t.slug);
  }

  const imagesRaw = await fetchJsonOrNull(`${WP_BASE}/wp-json/wp/v2/kv_image?per_page=100&_embed=1&orderby=menu_order&order=asc`);
  if (imagesRaw === null) {
    console.warn('kv_image CPT not found (WP-side not set up yet). Writing empty kv-images.json.');
    fs.writeFileSync(outFile, '[]\n', 'utf-8');
    return;
  }

  const items = [];
  for (const post of imagesRaw) {
    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (!imageUrl) {
      console.warn(`Skip kv_image id=${post.id} "${post.title?.rendered}": no featured image`);
      continue;
    }
    const locations = (post.kv_location || [])
      .map(id => locationMap.get(id))
      .filter(Boolean);
    if (locations.length === 0) {
      console.warn(`Skip kv_image id=${post.id} "${post.title?.rendered}": no kv_location term assigned`);
      continue;
    }
    const title = post.title?.rendered || '';
    items.push({
      id: post.id,
      title,
      image: imageUrl,
      alt: post.acf?.alt_text || title,
      caption: post.acf?.caption || '',
      locations,
      order: typeof post.menu_order === 'number' ? post.menu_order : 0,
    });
  }

  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} KV images to ${outFile}`);
}

main().catch(err => {
  const outFile = path.join(__dirname, '..', 'app', 'public', 'data', 'kv-images.json');
  if (fs.existsSync(outFile)) {
    console.warn(`Failed to fetch KV images: ${err?.message || err}`);
    console.warn(`Using existing ${outFile} as fallback.`);
  } else {
    console.warn(`Failed to fetch KV images: ${err?.message || err}. Writing empty kv-images.json.`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, '[]\n', 'utf-8');
  }
});
