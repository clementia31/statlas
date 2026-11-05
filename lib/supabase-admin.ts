import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Client serveur avec la clé de service (SUPABASE_SERVICE_ROLE_KEY, variable d'environnement Vercel).
// Utilisé uniquement par l'espace admin, pour lire les brouillons que le public ne voit pas.
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input: any, init?: any) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

export type Draft = {
  id: string;
  slug: string;
  title: string;
  lang: string;
  status: string;
  series: string | null;
  series_order: number | null;
  project: string;
  doc_url: string | null;
  published_slug: string | null;
  notes: string | null;
  updated_at: string;
};

export async function getDrafts(): Promise<{ drafts: Draft[]; error: string | null }> {
  const db = adminClient();
  if (!db) return { drafts: [], error: 'Clé de service manquante : ajoute SUPABASE_SERVICE_ROLE_KEY dans Vercel.' };
  const { data, error } = await db
    .from('article_drafts')
    .select('*')
    .order('series', { ascending: true, nullsFirst: false })
    .order('series_order', { ascending: true })
    .order('updated_at', { ascending: false });
  return { drafts: (data as Draft[]) ?? [], error: error?.message ?? null };
}

// ---- Contenus réseaux sociaux / Gazette (bibliothèque + calendrier)
export type SocialPost = {
  id: string;
  slug: string;
  title: string;
  kind: 'video' | 'image';
  media_url: string;
  poster_url: string | null;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduled_at: string | null;
  published_at: string | null;
  caption: string | null;
  notes: string | null;
  links: Record<string, string>;
};

export async function getPosts(): Promise<{ posts: SocialPost[]; error: string | null }> {
  const db = adminClient();
  if (!db) return { posts: [], error: 'Clé de service manquante : ajoute SUPABASE_SERVICE_ROLE_KEY dans Vercel.' };
  const { data, error } = await db.from('social_posts').select('*').order('scheduled_at', { ascending: true, nullsFirst: true });
  return { posts: (data as SocialPost[]) ?? [], error: error?.message ?? null };
}
