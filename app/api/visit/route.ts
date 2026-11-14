import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase-admin';
import { BOT, cleanPath, projectOf, sourceOf } from '@/lib/visits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Reçoit une « page vue » envoyée par le site et l'ajoute aux totaux du jour.
// Rien de personnel n'est gardé : ni adresse, ni cookie. L'empreinte qui évite de compter deux fois
// le même visiteur dans la journée change chaque jour et est effacée le lendemain.
const done = () => new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') ?? '';
    if (!ua || BOT.test(ua)) return done();
    if (req.cookies.get('statlas_studio')) return done(); // les visites du propriétaire ne comptent pas
    const host = req.headers.get('host') ?? '';
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== host) return done();

    const text = await req.text();
    if (text.length > 2000) return done();
    const body = JSON.parse(text) as { p?: unknown; r?: unknown; u?: unknown; e?: unknown };
    const path = cleanPath(body.p);
    if (!path) return done();

    const db = adminClient();
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!db || !secret) return done();

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
    const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
    const visitor = ip ? createHash('sha256').update(`${day}|${ip}|${ua}|${secret}`).digest('hex').slice(0, 32) : '';
    const country = (req.headers.get('x-vercel-ip-country') ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);

    await db.rpc('studio_track_visit', {
      p_project: projectOf(path),
      p_path: path,
      p_source: sourceOf(body.r, body.u, host, body.e === true),
      p_country: country,
      p_visitor: visitor,
    });
  } catch {
    // Un comptage manqué ne doit jamais gêner le visiteur.
  }
  return done();
}
