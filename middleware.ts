import { NextRequest, NextResponse } from 'next/server';

// Espace privé (/studio) : accessible seulement avec la clé ADMIN_KEY (variable d'environnement Vercel).
// Le lien /studio?k=<clé> dépose un cookie valable un an ; sans lui, une page « accès réservé » s'affiche.
// Sur un domaine studio.* (ex. studio.finalea.fr), l'accueil mène directement au Studio.
const COOKIE = 'statlas_admin';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  if (req.nextUrl.pathname === '/') {
    if (!host.startsWith('studio.')) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/studio';
    return NextResponse.redirect(url);
  }
  const key = process.env.ADMIN_KEY;
  if (!key) return new NextResponse('Admin non configuré (ADMIN_KEY manquante).', { status: 503 });
  const fromLink = req.nextUrl.searchParams.get('k');
  if (fromLink && fromLink === key) {
    const url = req.nextUrl.clone();
    url.searchParams.delete('k');
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, key, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' });
    return res;
  }
  if (req.cookies.get(COOKIE)?.value === key) {
    const res = NextResponse.next();
    res.headers.set('x-robots-tag', 'noindex');
    return res;
  }
  return new NextResponse('Accès réservé.', { status: 401, headers: { 'x-robots-tag': 'noindex' } });
}

export const config = { matcher: ['/', '/studio/:path*'] };
