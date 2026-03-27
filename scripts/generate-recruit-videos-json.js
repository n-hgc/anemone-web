import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchJson(url, init = {}) {
  const res = await fetch(url, { 
    headers: { 'Accept': 'application/json' }, 
    ...init 
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
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
    console.warn('API error, using fallback mock data:', error.message);
    // まだバックエンドに設定が反映されていない場合はモックデータを使用（Astroビルドが落ちないようにする）
    videos = [
      {
         id: 1,
         title: "littleは正社員or業務委託 1",
         video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
         thumbnail_url: "",
         link_url: "/news"
      },
      {
         id: 2,
         title: "littleは正社員or業務委託 2",
         video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
         thumbnail_url: "",
         link_url: ""
      },
      {
         id: 3,
         title: "littleは正社員or業務委託 3",
         video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
         thumbnail_url: "",
         link_url: "https://google.com"
      },
      {
         id: 4,
         title: "littleは正社員or業務委託 4",
         video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
         thumbnail_url: "",
         link_url: ""
      }
    ];
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
