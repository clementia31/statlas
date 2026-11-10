'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/supabase-admin';
import { BUCKET, FORMATS, NETWORKS, isIdeaKind, isProject, isUuid } from '@/lib/studio';

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

// ---- Idées

const MAX_FILE = 20 * 1024 * 1024;
const FILE_TYPES = /^(image\/(jpeg|png|webp|gif|heic|heif)|application\/pdf|text\/(plain|markdown|csv)|application\/(msword|rtf|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.oasis\.opendocument\.text))$/;

export async function createIdea(input: { title: string; body: string; kind: string; project: string }): Promise<{ id?: string; error?: string }> {
  const db = adminClient();
  if (!db) return { error: 'Service key missing.' };
  const title = input.title.trim();
  if (!title) return { error: 'A title is needed.' };
  const { data, error } = await db
    .from('studio_ideas')
    .insert({ title: title.slice(0, 200), body: input.body.trim() || null, kind: isIdeaKind(input.kind) ? input.kind : 'article', project: isProject(input.project) ? input.project : 'gazette' })
    .select('id')
    .maybeSingle();
  revalidatePath('/studio/ideas');
  return error || !data ? { error: error?.message ?? 'Could not save.' } : { id: data.id };
}

export async function addIdeaNote(ideaId: string, text: string): Promise<{ error?: string }> {
  const db = adminClient();
  if (!db || !isUuid(ideaId)) return { error: 'Not available.' };
  const body = text.trim();
  if (!body) return {};
  const { error } = await db.from('studio_idea_items').insert({ idea_id: ideaId, kind: 'note', body });
  await db.from('studio_ideas').update({ updated_at: new Date().toISOString() }).eq('id', ideaId);
  revalidatePath('/studio/ideas', 'layout');
  return error ? { error: error.message } : {};
}

// Étape 1 d'un envoi de fichier : le serveur vérifie le type et la taille, puis donne une adresse d'envoi à usage unique.
// Le fichier part ensuite directement du navigateur vers le stockage privé, sans passer par le site.
export async function signIdeaUpload(ideaId: string, file: { name: string; type: string; size: number }): Promise<{ path?: string; signedUrl?: string; error?: string }> {
  const db = adminClient();
  if (!db || !isUuid(ideaId)) return { error: 'Not available.' };
  if (!FILE_TYPES.test(file.type)) return { error: `${file.name}: this kind of file is not accepted (photo, PDF or text document only).` };
  if (!(file.size > 0) || file.size > MAX_FILE) return { error: `${file.name}: larger than 20 MB.` };
  const safe = file.name.normalize('NFD').replace(/[^\w.\-]+/g, '_').slice(-80) || 'file';
  const path = `ideas/${ideaId}/${crypto.randomUUID()}-${safe}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  return error || !data ? { error: error?.message ?? 'Could not prepare the upload.' } : { path, signedUrl: data.signedUrl };
}

// Étape 2 : une fois le fichier arrivé, on l'inscrit sur l'idée (après avoir vérifié qu'il est bien dans son dossier).
export async function attachIdeaFile(ideaId: string, path: string, file: { name: string; type: string; size: number }): Promise<{ error?: string }> {
  const db = adminClient();
  if (!db || !isUuid(ideaId) || !path.startsWith(`ideas/${ideaId}/`) || path.includes('..')) return { error: 'Not available.' };
  const folder = path.slice(0, path.lastIndexOf('/'));
  const { data: found } = await db.storage.from(BUCKET).list(folder, { search: path.slice(folder.length + 1) });
  if (!found || found.length === 0) return { error: `${file.name}: the file did not arrive.` };
  const { error } = await db.from('studio_idea_items').insert({ idea_id: ideaId, kind: 'file', file_path: path, file_name: file.name.slice(0, 200), mime: file.type, size_bytes: file.size });
  await db.from('studio_ideas').update({ updated_at: new Date().toISOString() }).eq('id', ideaId);
  revalidatePath('/studio/ideas', 'layout');
  return error ? { error: error.message } : {};
}

export async function saveIdea(form: FormData) {
  const db = adminClient();
  const id = String(form.get('id'));
  if (!db || !isUuid(id)) return;
  const title = String(form.get('title') || '').trim();
  const kind = form.get('kind');
  const project = form.get('project');
  await db
    .from('studio_ideas')
    .update({ ...(title ? { title: title.slice(0, 200) } : {}), body: String(form.get('body') ?? '').trim() || null, ...(isIdeaKind(kind) ? { kind } : {}), ...(isProject(project) ? { project } : {}), updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/studio/ideas', 'layout');
}

export async function setIdeaDone(form: FormData) {
  const db = adminClient();
  const id = String(form.get('id'));
  if (!db || !isUuid(id)) return;
  const done = form.get('done') === '1';
  await db.from('studio_ideas').update({ status: done ? 'done' : 'open', done_at: done ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', id);
  revalidatePath('/studio/ideas', 'layout');
}

// Crée le brouillon d'article à partir de l'idée : son texte et ses notes servent de point de départ.
// L'idée reste ouverte, pour continuer à y ajouter des éléments jusqu'à la rédaction.
export async function ideaToDraft(form: FormData) {
  const db = adminClient();
  const id = String(form.get('id'));
  if (!db || !isUuid(id)) return;
  const { data: idea } = await db.from('studio_ideas').select('*').eq('id', id).maybeSingle();
  if (!idea || idea.draft_slug) return;
  const { data: notes } = await db.from('studio_idea_items').select('body').eq('idea_id', id).eq('kind', 'note').order('created_at', { ascending: true });
  const slug = `${String(idea.title).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}-${id.slice(0, 6)}`;
  const body = [idea.body, ...(notes ?? []).map((n) => n.body)].filter(Boolean).join('\n\n');
  const { error } = await db.from('article_drafts').insert({ slug, title: idea.title, lang: 'en', status: 'idea', project: 'gazette', body: body || null, notes: 'Created from a Studio idea' });
  if (!error) await db.from('studio_ideas').update({ draft_slug: slug, updated_at: new Date().toISOString() }).eq('id', id);
  revalidatePath('/studio', 'layout');
}
