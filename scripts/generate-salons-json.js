// Node script: Fetch salon data from WordPress REST API and generate flat JSON
// Output: app/public/data/salons.index.json
//
// _embed=1 と taxonomy 一括取得により、N+1 リクエストを廃止。
// 99 salons → 約 700 calls だったものを 5 calls 前後に削減。

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
 * タクソノミー全体を1〜数リクエストでまとめて取得し、id→term のマップを返す。
 * parent 情報は単体エンドポイントから取得する必要があるため、_embed では代替できない。
 */
async function fetchTaxonomyMap(baseUrl, taxonomy) {
  const map = new Map();
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${baseUrl}/wp-json/wp/v2/${taxonomy}?per_page=100&page=${page}`;
    const { data, headers } = await fetchWithHeaders(url);
    if (!Array.isArray(data)) {
      throw new Error(`Invalid ${taxonomy} data format`);
    }
    for (const t of data) {
      map.set(t.id, {
        id: t.id,
        slug: t.slug,
        name: t.name,
        parent: t.parent || 0
      });
    }
    totalPages = Number(headers.get('X-WP-TotalPages') || headers.get('x-wp-totalpages') || 1);
    page++;
  } while (page <= totalPages);
  console.log(`Fetched ${map.size} ${taxonomy} terms`);
  return map;
}

function resolveTerms(ids, termMap) {
  if (!Array.isArray(ids)) return [];
  return ids
    .map(id => termMap.get(id))
    .filter(Boolean);
}

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';

  // 1. タクソノミー全件をマップ化（4 calls 前後）
  console.log('Fetching taxonomy maps...');
  const [regionMap, prefectureMap, jobRoleMap, employmentTypeMap] = await Promise.all([
    fetchTaxonomyMap(WP_BASE, 'region'),
    fetchTaxonomyMap(WP_BASE, 'prefecture'),
    fetchTaxonomyMap(WP_BASE, 'job_role'),
    fetchTaxonomyMap(WP_BASE, 'employment_type'),
  ]);

  // 2. サロン本体を _embed=1 でまとめて取得（1〜数 calls）
  console.log('Fetching salon data from WordPress...');
  const allSalons = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${WP_BASE}/wp-json/wp/v2/salon_v2?per_page=100&page=${page}&_embed=1`;
    const { data, headers } = await fetchWithHeaders(url);
    if (!Array.isArray(data)) {
      throw new Error('Invalid salon data format');
    }
    allSalons.push(...data);
    totalPages = Number(headers.get('X-WP-TotalPages') || headers.get('x-wp-totalpages') || 1);
    console.log(`Fetched ${data.length} salons (page ${page}/${totalPages}), total: ${allSalons.length}`);
    page++;
  } while (page <= totalPages);

  console.log(`Found ${allSalons.length} salons total, processing...`);

  const items = [];
  for (const salon of allSalons) {
    try {
      const id = salon.id;
      const title = salon.title?.rendered || '';
      const furigana = salon.acf?.furigana || '';
      const access = salon.acf?.access || '';
      const isHiring = salon.acf?.is_hiring || false;
      const reservationUrl = salon.acf?.reservation_url || '';
      const mapsUrl = salon.acf?.maps_url || '';

      // 画像URLは _embedded から取得（追加リクエスト不要）
      const thumbUrl = salon._embedded?.['wp:featuredmedia']?.[0]?.source_url;
      const thumb = thumbUrl || '/images/salon/salon-image-01.png';

      // タクソノミーは事前構築したマップから解決
      const region = resolveTerms(salon.region, regionMap);
      const prefectureTerms = resolveTerms(salon.prefecture, prefectureMap);
      const jobRole = resolveTerms(salon.job_role, jobRoleMap);
      const employmentType = resolveTerms(salon.employment_type, employmentTypeMap);

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
