'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/supabase-admin';
import { FORMATS, NETWORKS, isProject } from '@/lib/studio';

// Heure de Paris -> instant UTC, été comme hiver (le décalage est lu dans le fuseau, pas fixé à +01:00).
function parisToIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const guess = new Date(`${date}T${time}:00Z`);
  const shown = new Date(guess.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const asUtc = new Date(guess.toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(guess.getTime() - (shown.getTime() - asUtc.getTime())).toISOString();
}

function common(form: FormData) {
  const date = String(form.get('date') || '');
  const time = String(form.get('time') || '12:00');
  const project = form.get('project');
  const format = String(form.get('format') || '');
  return {
    scheduled_at: date ? parisToIso(date, time) : null,
    platforms: form.getAll('platforms').map(String).filter((p) => p in NETWORKS),
    project: isProject(project) ? project : 'statlas',
    format: format in FORMATS ? format : null,
  };
}

export async function savePost(form: FormData) {
  const db = adminClient();
  if (!db) return;
  const id = String(form.get('id'));
  const c = common(form);
  const links: Record<string, string> = {};
  for (const p of Object.keys(NETWORKS)) {
    const v = String(form.get(`link_${p}`) ?? '').trim();
    if (/^https?:\/\//.test(v)) links[p] = v;
  }
  const current = String(form.get('current_status') || 'draft');
  const status = current === 'published' ? 'published' : c.scheduled_at ? 'scheduled' : 'draft';
  await db
    .from('social_posts')
    .update({
      ...c,
      status,
      links,
      title: String(form.get('title') || '').trim() || undefined,
      caption: String(form.get('caption') ?? '') || null,
      notes: String(form.get('notes') ?? '') || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  revalidatePath('/studio', 'layout');
}

export async function setPublished(form: FormData) {
  const db = adminClient();
  if (!db) return;
  const id = String(form.get('id'));
  const publish = form.get('publish') === '1';
  const scheduled = String(form.get('scheduled_at') || '');
  await db
    .from('social_posts')
    .update(
      publish
        ? { status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        : { status: scheduled ? 'scheduled' : 'draft', published_at: null, updated_at: new Date().toISOString() },
    )
    .eq('id', id);
  revalidatePath('/studio', 'layout');
}

export async function createPost(form: FormData) {
  const db = adminClient();
  if (!db) return;
  const title = String(form.get('title') || '').trim();
  const media = String(form.get('media_url') || '').trim();
  if (!title || !/^(\/|https:\/\/)/.test(media)) return;
  const c = common(form);
  const slug = `${title.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}-${Date.now().toString(36)}`;
  const { data } = await db
    .from('social_posts')
    .insert({
      ...c,
      slug,
      title,
      media_url: media,
      kind: /\.(mp4|mov|webm)$/i.test(media) ? 'video' : 'image',
      status: c.scheduled_at ? 'scheduled' : 'draft',
      platforms: c.platforms.length ? c.platforms : ['instagram', 'x'],
    })
    .select('id')
    .maybeSingle();
  revalidatePath('/studio', 'layout');
  if (data?.id) redirect(`/studio/publications/${data.id}`);
}

const METRICS = ['followers_instagram', 'followers_x', 'visitors', 'page_views', 'google_clicks'];

export async function addReading(form: FormData) {
  const db = adminClient();
  if (!db) return;
  const project = form.get('project');
  const metric = String(form.get('metric') || '');
  const value = Number(form.get('value'));
  const date = String(form.get('date') || '');
  if (!isProject(project) || !METRICS.includes(metric) || !Number.isFinite(value) || value < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  await db
    .from('studio_metric_readings')
    .upsert({ project, metric, value, reading_date: date, note: String(form.get('note') ?? '') || null }, { onConflict: 'project,metric,reading_date' });
  revalidatePath('/studio/metrics');
}
