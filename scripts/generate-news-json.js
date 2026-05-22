// Node script: Fetch news (blog) data from WordPress REST API and generate flat JSON
// Output: app/public/data/news.index.json

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

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => {
      const cp = parseInt(hex, 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    })
    .replace(/&#(\d+);/g, (m, dec) => {
      const cp = parseInt(dec, 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    })
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

function toPlainText(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function mapBlogToNews(p) {
  const media = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const categories = (p.news_type_terms ?? []).map(t => t.name);

  let content = p.content?.rendered ?? '';
  if (content && !content.includes('<p>')) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    content = lines.map(line => `<p>${line.trim()}</p>`).join('\n');
  }

  return {
    id: p.id,
    title: decodeHtml(p.title?.rendered ?? ''),
    date: p.date_gmt,
    categories: categories.length > 0 ? categories : ['INFORMATION'],
    featured_image: media || undefined,
    excerpt: decodeHtml(toPlainText(p.content?.rendered ?? '')).slice(0, 120),
    content,
    tags: [],
    slug: p.slug,
  };
}

async function main() {
  const WP_BASE = process.env.WP_BASE_URL || 'https://anemone-salon.com';

  console.log('Fetching news (blog) data from WordPress...');
  const allPosts = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `${WP_BASE}/wp-json/wp/v2/blog?_embed=1&per_page=100&page=${page}&status=publish&order=desc&orderby=date`;
    const { data, headers } = await fetchWithHeaders(url);
    if (!Array.isArray(data)) {
      throw new Error('Invalid blog data format');
    }
    allPosts.push(...data);
    totalPages = Number(headers.get('X-WP-TotalPages') || headers.get('x-wp-totalpages') || 1);
    console.log(`Fetched ${data.length} blog posts (page ${page}/${totalPages}), total: ${allPosts.length}`);
    page++;
  } while (page <= totalPages);

  const items = allPosts.map(mapBlogToNews);

  const outDir = path.join(__dirname, '..', 'app', 'public', 'data');
  const outFile = path.join(outDir, 'news.index.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} news items to ${outFile}`);
}

main().catch(err => {
  const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'app', 'public', 'data', 'news.index.json');
  if (fs.existsSync(outFile)) {
    console.warn(`Failed to fetch news data: ${err?.message || err}`);
    console.warn(`Using existing ${outFile} as fallback.`);
  } else {
    console.error(err);
    process.exit(1);
  }
});
