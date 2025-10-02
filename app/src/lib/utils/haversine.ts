// ハーバーサイン公式を使用した距離計算（km単位）
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 6371; // 地球の半径（km）
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) ** 2 + 
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) ** 2;
  
  return 2 * R * Math.asin(Math.sqrt(a));
}

// 現在位置から店舗までの距離を計算
export function calculateDistanceToSalon(
  userLat: number, 
  userLon: number, 
  salonLat: number, 
  salonLon: number
): number {
  return haversine(userLat, userLon, salonLat, salonLon);
}
