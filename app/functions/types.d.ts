// Cloudflare Pages Functions の型定義
export interface EventContext {
  request: Request;
  next: () => Promise<Response>;
  env: {
    BASIC_AUTH_ENABLED?: string;
    BASIC_AUTH_CREDENTIALS?: string;
  };
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
}
