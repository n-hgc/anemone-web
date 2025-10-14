import type { MiddlewareHandler } from 'astro';

// Basic認証のミドルウェア
export const onRequest: MiddlewareHandler = (context, next) => {
  // 認証が有効かどうかを環境変数で制御
  const authEnabled = import.meta.env.BASIC_AUTH_ENABLED === 'true';
  const basicAuth = import.meta.env.BASIC_AUTH_CREDENTIALS;
  
  // 認証が無効の場合はスキップ
  if (!authEnabled) {
    return next();
  }
  
  // 認証情報が設定されていない場合は警告してスキップ
  if (!basicAuth) {
    console.warn('BASIC_AUTH_CREDENTIALS environment variable is not set');
    return next();
  }
  
  const authHeader = context.request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Anemone Salon - Restricted"',
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
  
  try {
    const credentials = authHeader.split(' ')[1];
    const [username, password] = atob(credentials).split(':');
    const [expectedUsername, expectedPassword] = basicAuth.split(':');
    
    if (username !== expectedUsername || password !== expectedPassword) {
      return new Response('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Anemone Salon - Restricted"',
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  } catch (error) {
    console.error('Basic auth error:', error);
    return new Response('Authentication error', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Anemone Salon - Restricted"',
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
  
  return next();
};
