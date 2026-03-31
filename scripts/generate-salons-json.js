// Node script: Fetch salon data from WordPress REST API and generate flat JSON
// Output: app/public/data/salons.index.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchJson(url, init = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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
    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`Fetch attempt ${attempt}/${retries} failed for ${url}: ${e?.message || e}. Retrying...`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function fetchTaxonomyTerms(baseUrl, taxonomy, ids) {
  if (!ids || ids.length === 0) return [];

  const terms = [];
  for (const id of ids) {
    try {
      const term = await fetchJson(`${baseUrl}/wp-json/wp/v2/${taxonomy}/${id}`);
      terms.push({
        id: term.id,
        slug: term.slug,
        name: term.name,
        parent: term.parent || 0
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
  
  // 全てのサロンデータを取得（ページネーション対応）
  console.log('Fetching salon data from WordPress...');
  let allSalons = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const salonUrl = `${WP_BASE}/wp-json/wp/v2/salon_v2?per_page=100&page=${page}`;
    const salons = await fetchJson(salonUrl);
    
    if (!Array.isArray(salons)) {
      throw new Error('Invalid salon data format');
    }
    
    allSalons = allSalons.concat(salons);
    
    // 100件未満なら最後のページ
    hasMore = salons.length === 100;
    page++;
    
    console.log(`Fetched ${salons.length} salons (page ${page - 1}), total: ${allSalons.length}`);
  }
  
  console.log(`Found ${allSalons.length} salons total, processing...`);
  const salons = allSalons;

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
      const prefectureTerms = await fetchTaxonomyTerms(WP_BASE, 'prefecture', salon.prefecture);
      const jobRole = await fetchTaxonomyTerms(WP_BASE, 'job_role', salon.job_role);
      const employmentType = await fetchTaxonomyTerms(WP_BASE, 'employment_type', salon.employment_type);

      // prefecture タクソノミーを親（都道府県）と子（市区町村等）に分離
      const prefecture = prefectureTerms
        .filter(t => t.parent === 0)
        .map(({ id: _id, parent: _p, ...rest }) => rest);
      const prefectureChild = prefectureTerms
        .filter(t => t.parent !== 0)
        .map(({ id: _id, parent: _p, ...rest }) => rest);

      items.push({
        id,
        title,
        furigana,
        thumb,
        region,
        prefecture,
        prefecture_child: prefectureChild,
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
  const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app', 'public', 'data', 'salons.index.json');
  if (fs.existsSync(outFile)) {
    console.warn(`Failed to fetch salon data: ${err?.message || err}`);
    console.warn(`Using existing ${outFile} as fallback.`);
  } else {
    console.error(err);
    process.exit(1);
  }
});
