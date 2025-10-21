// Node script: Fetch hairstyle page (ACF) from WordPress and generate flat JSON
// Output: app/public/data/hairstyles.index.json

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
  const pageUrl = `${WP_BASE}/wp-json/wp/v2/pages?slug=hairstyle`;

  const pages = await fetchJson(pageUrl);
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('hairstyle page not found');
  }
  const page = pages[0];
  const hairstyles = (page?.acf?.hairstyles ?? []);

  const items = [];
  const seen = new Set();

  // ACF構造: 配列要素の中に group-1..group-5 があり、各 group に { image, hair-type }
  for (const row of hairstyles) {
    if (!row || typeof row !== 'object') continue;
    for (let i = 1; i <= 5; i++) {
      const group = row[`group-${i}`];
      if (!group || !group['image'] || group['image'] === false) continue;
      const imageId = group['image'];
      const hairType = group['hair-type'];
      if (!imageId || !hairType) continue;

      if (seen.has(imageId)) continue;

      try {
        const media = await fetchJson(`${WP_BASE}/wp-json/wp/v2/media/${imageId}`);
        const imageUrl = media?.source_url;
        const alt = media?.alt_text || media?.title?.rendered || '';
        if (!imageUrl) continue;
        items.push({ id: imageId, hairType, imageUrl, alt });
        seen.add(imageId);
      } catch (e) {
        // skip this image if failed
        console.warn('media fetch failed for id', imageId, e?.message || e);
      }
    }
  }

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'hairstyles.index.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} items to ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


