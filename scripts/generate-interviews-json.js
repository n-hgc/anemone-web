// Node script: Fetch interview data from WordPress REST API and generate flat JSON
// Output: app/public/data/interviews.index.json

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

// HTMLコンテンツを処理してテキスト部分を<p>タグで囲む関数
function processContent(htmlContent) {
  if (!htmlContent) return '';
  
  // 既存のHTMLタグを保持しながら、テキスト部分を<p>タグで囲む
  let processedContent = htmlContent
    // 改行文字を統一
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 連続する改行を単一の改行に
    .replace(/\n{3,}/g, '\n\n')
    // 既存のHTMLタグの前後で分割
    .split(/(<[^>]+>)/)
    .map(part => {
      // HTMLタグの場合はそのまま返す
      if (part.startsWith('<')) {
        return part;
      }
      
      // 空の文字列や空白のみの場合はそのまま返す
      if (!part.trim()) {
        return part;
      }
      
      // テキスト部分を処理
      return part
        .split('\n\n') // 段落ごとに分割
        .map(paragraph => {
          const trimmed = paragraph.trim();
          if (!trimmed) return paragraph;
          
          // 既に<p>タグで囲まれている場合はそのまま返す
          if (trimmed.startsWith('<p>') && trimmed.endsWith('</p>')) {
            return paragraph;
          }
          
          // テキストを<p>タグで囲む
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
  
  // 指定されたIDのインタビューデータを取得
  const targetIds = [5619, 5614, 5625];
  const items = [];

  console.log('Fetching interview data from WordPress...');

  for (const id of targetIds) {
    try {
      const interviewUrl = `${WP_BASE}/wp-json/wp/v2/interview/${id}`;
      const interview = await fetchJson(interviewUrl);
      
      // 基本情報
      const title = interview.title?.rendered || '';
      const rawContent = interview.content?.rendered || '';
      const content = processContent(rawContent);
      const slug = interview.slug || '';
      const date = interview.date || '';
      const modified = interview.modified || '';
      
      // ヒーロー画像URLを取得
      const heroImageUrl = await fetchMediaUrl(WP_BASE, interview.featured_media);
      
      items.push({
        id,
        title,
        content,
        slug,
        date,
        modified,
        heroImageUrl
      });

      console.log(`Processed: ${title}`);
    } catch (e) {
      console.warn(`Failed to process interview ${id}:`, e?.message || e);
    }
  }

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'interviews.index.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} interviews to ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
