import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchJson(url, init = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
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

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';
  console.log('Fetching recruit videos from WordPress...');
  
  let videos = [];
  try {
    const videoUrl = `${WP_BASE}/wp-json/wp/v2/recruit_video?per_page=100`;
    const rawVideos = await fetchJson(videoUrl);
    
    for (const v of rawVideos) {
       // taxonomy 'recruit_video_category' で「表示」カテゴリかどうかを判定することも可能
       videos.push({
         id: v.id,
         title: v.title?.rendered || '',
         video_url: v.acf?.video_file || '',
         thumbnail_url: v.acf?.thumbnail || '',
         link_url: v.acf?.link_url || '', // 任意の遷移先URLを追加
       });
    }
  } catch (error) {
    console.warn('API error, hiding videos section:', error.message);
    // API 失敗時は空配列にしてセクション自体を非表示にする（ダミー動画が本番に出ないように）
    videos = [];
  }

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'recruit-videos.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(videos, null, 2), 'utf-8');
  console.log(`Wrote ${videos.length} recruit videos to ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
