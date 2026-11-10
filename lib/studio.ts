import 'server-only';
import { adminClient } from './supabase-admin';

export type Project = 'statlas' | 'gazette' | 'myinvesta';
export type Post = {
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
  project: Project;
  format: string | null;
};
export type Reading = { id: number; project: Project; metric: string; reading_date: string; value: number; note: string | null };

export const TZ = 'Europe/Paris';
export const PROJECTS: Record<Project, { label: string; color: string }> = {
  statlas: { label: 'Statlas', color: '#1F4FD1' },
  gazette: { label: 'Gazette', color: '#8B1E1E' },
  myinvesta: { label: 'MyInvesta', color: '#1C7C4A' },
};
export const FORMATS: Record<string, { label: string; color: string }> = {
  ranking: { label: 'Ranking', color: '#1F4FD1' },
  map: { label: 'Map', color: '#1C7C4A' },
  key_figure: { label: 'Key figure', color: '#B4530F' },
  quote: { label: 'Quote', color: '#7A4FB5' },
  article: { label: 'Article', color: '#8B1E1E' },
  list: { label: 'List', color: '#15171A' },
  chart: { label: 'Chart', color: '#2E9C8F' },
};
export const NETWORKS: Record<string, string> = { instagram: 'Instagram', x: 'X', gazette: 'Gazette' };
export const STATUS: Record<Post['status'], string> = { draft: 'Idea', scheduled: 'Ready', published: 'Published' };

export const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
export const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
export const todayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
export const isProject = (v: unknown): v is Project => v === 'statlas' || v === 'gazette' || v === 'myinvesta';

const MISSING = 'Service key missing: add SUPABASE_SERVICE_ROLE_KEY in Vercel.';

export async function getPosts(): Promise<{ posts: Post[]; error: string | null }> {
  const db = adminClient();
  if (!db) return { posts: [], error: MISSING };
  const { data, error } = await db.from('social_posts').select('*').order('scheduled_at', { ascending: true, nullsFirst: false });
  return { posts: (data as Post[]) ?? [], error: error?.message ?? null };
}

export async function getPost(id: string): Promise<Post | null> {
  const db = adminClient();
  if (!db || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db.from('social_posts').select('*').eq('id', id).maybeSingle();
  return (data as Post) ?? null;
}

export async function getReadings(): Promise<{ readings: Reading[]; error: string | null }> {
  const db = adminClient();
  if (!db) return { readings: [], error: MISSING };
  const { data, error } = await db.from('studio_metric_readings').select('*').order('reading_date', { ascending: false }).limit(500);
  return { readings: (data as Reading[]) ?? [], error: error?.message ?? null };
}
