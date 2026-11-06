import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// Export JSON des articles publiés (admin seulement, protégé par le middleware) : sert aux traductions FR / ES.
export async function GET() {
  const db = adminClient();
  if (!db) return NextResponse.json({ error: 'no service key' }, { status: 503 });
  const { data, error } = await db.from('articles').select('*').order('published_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' } });
}
