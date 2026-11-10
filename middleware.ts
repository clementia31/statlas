import { NextRequest, NextResponse } from 'next/server';

// Espace privé (/studio) : accessible seulement avec la clé ADMIN_KEY (variable d'environnement Vercel).
// Sans cookie valide, une page de connexion demande la clé ; elle est envoyée par formulaire (jamais dans l'adresse).
// L'ancien lien /studio?k=<clé> reste accepté. Le cookie contient une empreinte de la clé, pas la clé elle-même.
// Sur un domaine studio.* (ex. studio.finalea.fr), l'accueil mène directement au Studio.
const COOKIE = 'statlas_studio';
const YEAR = 60 * 60 * 24 * 365;

async function fingerprint(key: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`studio:${key}`)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Comparaison à durée constante, pour ne rien révéler de la clé par le temps de réponse.
function same(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function loginPage(wrong: boolean) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Studio</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F7F5EF;color:#15171A;font-family:Inter,system-ui,sans-serif}
form{width:min(380px,calc(100vw - 32px));background:#fff;border:1px solid #DEDAD0;border-radius:12px;padding:24px}
h1{margin:0 0 4px;font-family:Georgia,serif;font-size:28px}p{margin:0 0 16px;font-size:14px;color:#5B6270}
label{display:block;font-size:13px;color:#3F4550;margin-bottom:6px}
input{box-sizing:border-box;width:100%;height:44px;border:1px solid #CFCABD;border-radius:8px;padding:0 12px;font-size:16px}
button{margin-top:14px;width:100%;height:44px;border:0;border-radius:8px;background:#1F4FD1;color:#fff;font-size:15px;font-weight:600}
.err{margin:0 0 12px;padding:10px 12px;border-radius:8px;background:#FBE9E7;color:#B42318;font-size:14px}</style></head>
<body><form method="post" action="/studio/login"><h1>Studio</h1><p>Private area.</p>
${wrong ? '<div class="err" role="alert">That key is not the right one. Check for a missing or extra character.</div>' : ''}
<label for="key">Access key</label><input id="key" name="key" type="password" autocomplete="current-password" required autofocus>
<button type="submit">Open the Studio</button></form></body></html>`;
  return new NextResponse(html, { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex', 'cache-control': 'no-store' } });
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const path = req.nextUrl.pathname;
  if (path === '/') {
    if (!host.startsWith('studio.')) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/studio';
    return NextResponse.redirect(url);
  }
  const key = (process.env.ADMIN_KEY ?? '').trim();
  if (!key) return new NextResponse('Studio not configured (ADMIN_KEY is missing).', { status: 503 });
  const expected = await fingerprint(key);
  const grant = (to: URL) => {
    const res = NextResponse.redirect(to, 303);
    res.cookies.set(COOKIE, expected, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: YEAR, path: '/' });
    return res;
  };

  if (path === '/studio/login') {
    const home = req.nextUrl.clone();
    home.pathname = '/studio';
    home.search = '';
    if (req.method !== 'POST') return NextResponse.redirect(home);
    const form = await req.formData().catch(() => null);
    const given = String(form?.get('key') ?? '').trim();
    return given && same(given, key) ? grant(home) : loginPage(true);
  }

  const fromLink = (req.nextUrl.searchParams.get('k') ?? '').trim();
  if (fromLink && same(fromLink, key)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete('k');
    return grant(url);
  }
  if (same(req.cookies.get(COOKIE)?.value ?? '', expected)) {
    const res = NextResponse.next();
    res.headers.set('x-robots-tag', 'noindex');
    return res;
  }
  return loginPage(false);
}

export const config = { matcher: ['/', '/studio/:path*'] };
