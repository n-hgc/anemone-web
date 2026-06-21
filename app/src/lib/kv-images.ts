import type { KvImage } from "../types";

export interface KvSlide {
  image: string;
  alt: string;
  caption: string;
}

// 静的フォールバック (WP 側に該当 location のスライドが 0 件のとき使用)
const FALLBACKS: Record<string, KvSlide[]> = {
  "top-hero": [
    { image: "/images/hero/slide-1.jpg", alt: "アネモネサロンの店内", caption: "" },
    { image: "/images/hero/slide-2.jpg", alt: "アネモネサロンの店内", caption: "" },
    { image: "/images/hero/slide-3.jpg", alt: "アネモネサロンのスタイリング", caption: "" },
  ],
  "recruit-hero": [
    { image: "/images/recruit/hero-image-1.png", alt: "メインビジュアル", caption: "" },
    { image: "/images/recruit/hero-image-1-2.jpg", alt: "メインビジュアル", caption: "" },
    { image: "/images/recruit/hero-image-1-3.jpg", alt: "メインビジュアル", caption: "" },
  ],
  "top-hairmake": [
    { image: "/images/main/hairmake.jpg", alt: "ヘアメイクサービス", caption: "" },
  ],
};

let cache: KvImage[] | null = null;

async function loadKvImages(): Promise<KvImage[]> {
  if (cache) return cache;
  try {
    const fs = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "public", "data", "kv-images.json");
    cache = JSON.parse(fs.readFileSync(p, "utf-8")) as KvImage[];
  } catch {
    cache = [];
  }
  return cache;
}

export async function getKvSlides(location: string): Promise<KvSlide[]> {
  const all = await loadKvImages();
  const matched = all
    .filter((img) => img.locations.includes(location))
    .sort((a, b) => a.order - b.order)
    .map<KvSlide>((img) => ({
      image: img.image,
      alt: img.alt,
      caption: img.caption,
    }));
  return matched.length > 0 ? matched : FALLBACKS[location] ?? [];
}
