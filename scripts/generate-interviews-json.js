// Node script: Fetch interview data from WordPress REST API and generate flat JSON
// Output: app/public/data/interviews.index.json
//
// include= で interview と media を一括取得し、N+1 リクエストを廃止。
// 部分失敗時は既存ファイルを保持して空書きを防止。

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchJson(url, retries = 3) {
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
      return res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`Fetch attempt ${attempt}/${retries} failed for ${url}: ${e?.message || e}. Retrying...`);
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// HTMLコンテンツを処理してテキスト部分を<p>タグで囲む関数
function processContent(htmlContent) {
  if (!htmlContent) return '';

  let processedContent = htmlContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split(/(<[^>]+>)/)
    .map(part => {
      if (part.startsWith('<')) return part;
      if (!part.trim()) return part;
      return part
        .split('\n\n')
        .map(paragraph => {
          const trimmed = paragraph.trim();
          if (!trimmed) return paragraph;
          if (trimmed.startsWith('<p>') && trimmed.endsWith('</p>')) return paragraph;
          return `<p>${trimmed}</p>`;
        })
        .join('\n');
    })
    .join('');

  // 見出しタグ内の<p>タグを除去
  processedContent = processedContent.replace(/<(h[1-6])><p>(.*?)<\/p><\/\1>/g, '<$1>$2</$1>');

  return processedContent;
}

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';

  const targetIds = [5619, 5614, 5625];

  console.log('Fetching interview data from WordPress...');

  // 1. interview 本体を1リクエストで取得
  const interviewsUrl = `${WP_BASE}/wp-json/wp/v2/interview?include=${targetIds.join(',')}&per_page=${targetIds.length}&orderby=include`;
  const interviews = await fetchJson(interviewsUrl);
  if (!Array.isArray(interviews) || interviews.length === 0) {
    throw new Error('No interview data returned');
  }

  // 2. featured_media を一括取得
  const mediaIds = interviews.map(i => i.featured_media).filter(Boolean);
  const mediaMap = new Map();
  if (mediaIds.length > 0) {
    const mediaUrl = `${WP_BASE}/wp-json/wp/v2/media?include=${mediaIds.join(',')}&per_page=${mediaIds.length}`;
    const mediaList = await fetchJson(mediaUrl);
    if (Array.isArray(mediaList)) {
      for (const m of mediaList) {
        mediaMap.set(m.id, m.source_url);
      }
    }
  }

  // 3. 結合
  const items = [];
  for (const interview of interviews) {
    const title = interview.title?.rendered || '';
    const rawContent = interview.content?.rendered || '';
    const content = processContent(rawContent);
    items.push({
      id: interview.id,
      title,
      content,
      slug: interview.slug || '',
      date: interview.date || '',
      modified: interview.modified || '',
      heroImageUrl: mediaMap.get(interview.featured_media) || null
    });
    console.log(`Processed: ${title}`);
  }

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'interviews.index.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} interviews to ${outFile}`);
}

main().catch(err => {
  const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app', 'public', 'data', 'interviews.index.json');
  if (fs.existsSync(outFile)) {
    console.warn(`Failed to fetch interview data: ${err?.message || err}`);
    console.warn(`Using existing ${outFile} as fallback.`);
  } else {
    console.error(err);
    process.exit(1);
  }
});
