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

// ---- Idées et sujets à traiter
export type Idea = {
  id: string;
  title: string;
  body: string | null;
  kind: 'article' | 'chart' | 'topic';
  project: Project;
  status: 'open' | 'done';
  draft_slug: string | null;
  created_at: string;
  updated_at: string;
};
export type IdeaItem = {
  id: string;
  idea_id: string;
  kind: 'note' | 'file';
  body: string | null;
  file_path: string | null;
  file_name: string | null;
  mime: string | null;
  size_bytes: number | null;
  created_at: string;
  url?: string | null;
};
export const IDEA_KINDS: Record<Idea['kind'], { label: string; color: string }> = {
  article: { label: 'Article', color: '#8B1E1E' },
  chart: { label: 'Chart', color: '#1F4FD1' },
  topic: { label: 'Topic to dig', color: '#B4530F' },
};
export const BUCKET = 'studio';
export const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const isIdeaKind = (v: unknown): v is Idea['kind'] => v === 'article' || v === 'chart' || v === 'topic';

// Liens temporaires (1 h) vers les fichiers privés, créés côté serveur au moment d'afficher la page.
async function withUrls(items: IdeaItem[]): Promise<IdeaItem[]> {
  const db = adminClient();
  const paths = items.filter((i) => i.kind === 'file' && i.file_path).map((i) => i.file_path!);
  if (!db || paths.length === 0) return items;
  const { data } = await db.storage.from(BUCKET).createSignedUrls(paths, 3600);
  const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return items.map((i) => (i.file_path ? { ...i, url: byPath.get(i.file_path) ?? null } : i));
}

export async function getIdeas(): Promise<{ ideas: Idea[]; items: IdeaItem[]; error: string | null }> {
  const db = adminClient();
  if (!db) return { ideas: [], items: [], error: MISSING };
  const [a, b] = await Promise.all([
    db.from('studio_ideas').select('*').order('created_at', { ascending: false }),
    db.from('studio_idea_items').select('*').order('created_at', { ascending: true }),
  ]);
  return { ideas: (a.data as Idea[]) ?? [], items: await withUrls((b.data as IdeaItem[]) ?? []), error: a.error?.message ?? b.error?.message ?? null };
}

export async function getIdea(id: string): Promise<{ idea: Idea; items: IdeaItem[] } | null> {
  const db = adminClient();
  if (!db || !isUuid(id)) return null;
  const [a, b] = await Promise.all([
    db.from('studio_ideas').select('*').eq('id', id).maybeSingle(),
    db.from('studio_idea_items').select('*').eq('idea_id', id).order('created_at', { ascending: true }),
  ]);
  if (!a.data) return null;
  return { idea: a.data as Idea, items: await withUrls((b.data as IdeaItem[]) ?? []) };
}
