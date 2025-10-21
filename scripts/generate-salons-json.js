// Node script: Fetch salon data from WordPress REST API and generate flat JSON
// Output: app/public/data/salons.index.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchJson(url, init = {}) {
  const res = await fetch(url, { 
    headers: { 
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br'
    }, 
    ...init 
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function fetchTaxonomyTerms(baseUrl, taxonomy, ids) {
  if (!ids || ids.length === 0) return [];
  
  const terms = [];
  for (const id of ids) {
    try {
      const term = await fetchJson(`${baseUrl}/wp-json/wp/v2/${taxonomy}/${id}`);
      terms.push({
        slug: term.slug,
        name: term.name
      });
    } catch (e) {
      console.warn(`Failed to fetch ${taxonomy} term ${id}:`, e?.message || e);
    }
  }
  return terms;
}

async function fetchMediaUrl(baseUrl, mediaId) {
  if (!mediaId) return null;
  
  try {
    const media = await fetchJson(`${baseUrl}/wp-json/wp/v2/media/${mediaId}`);
    return media?.source_url || null;
  } catch (e) {
    console.warn(`Failed to fetch media ${mediaId}:`, e?.message || e);
    return null;
  }
}

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';
  const salonUrl = `${WP_BASE}/wp-json/wp/v2/salon_v2`;

  console.log('Fetching salon data from WordPress...');
  const salons = await fetchJson(salonUrl);
  
  if (!Array.isArray(salons)) {
    throw new Error('Invalid salon data format');
  }

  console.log(`Found ${salons.length} salons, processing...`);

  const items = [];

  for (const salon of salons) {
    try {
      // 基本情報
      const id = salon.id;
      const title = salon.title?.rendered || '';
      const furigana = salon.acf?.furigana || '';
      const access = salon.acf?.access || '';
      const isHiring = salon.acf?.is_hiring || false;
      const reservationUrl = salon.acf?.reservation_url || '';
      const mapsUrl = salon.acf?.maps_url || '';

      // 画像URLを取得
      const thumbUrl = await fetchMediaUrl(WP_BASE, salon.featured_media);
      const thumb = thumbUrl || '/images/salon/salon-image-01.png'; // フォールバック

      // タクソノミー情報を取得
      const region = await fetchTaxonomyTerms(WP_BASE, 'region', salon.region);
      const prefecture = await fetchTaxonomyTerms(WP_BASE, 'prefecture', salon.prefecture);
      const city = await fetchTaxonomyTerms(WP_BASE, 'city', salon.city);
      const jobRole = await fetchTaxonomyTerms(WP_BASE, 'job_role', salon.job_role);
      const employmentType = await fetchTaxonomyTerms(WP_BASE, 'employment_type', salon.employment_type);

      items.push({
        id,
        title,
        furigana,
        thumb,
        region,
        prefecture,
        city,
        job_role: jobRole,
        employment_type: employmentType,
        is_hiring: isHiring,
        reservation_url: reservationUrl,
        maps_url: mapsUrl,
        access
      });

      console.log(`Processed: ${title}`);
    } catch (e) {
      console.warn(`Failed to process salon ${salon.id}:`, e?.message || e);
    }
  }

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'salons.index.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} salons to ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
