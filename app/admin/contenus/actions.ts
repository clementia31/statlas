'use server';

import { revalidatePath } from 'next/cache';
import { adminClient } from '@/lib/supabase-admin';

// Mise à jour d'un contenu depuis l'espace admin (date, statut, plateformes, texte, liens publiés)
export async function updatePost(form: FormData) {
  const db = adminClient();
  if (!db) return;
  const id = String(form.get('id'));
  const date = String(form.get('date') || '');
  const time = String(form.get('time') || '12:00');
  const status = String(form.get('status') || 'draft');
  const platforms = form.getAll('platforms').map(String);
  const scheduled_at = date ? new Date(`${date}T${time}:00+01:00`).toISOString() : null;
  const patch: Record<string, unknown> = {
    status: status === 'draft' && scheduled_at ? 'scheduled' : status,
    scheduled_at,
    platforms,
    caption: String(form.get('caption') ?? '') || null,
    notes: String(form.get('notes') ?? '') || null,
    updated_at: new Date().toISOString(),
  };
  const links: Record<string, string> = {};
  for (const p of ['x', 'instagram', 'gazette']) {
    const v = String(form.get(`link_${p}`) ?? '').trim();
    if (v) links[p] = v;
  }
  patch.links = links;
  if (status === 'published') patch.published_at = scheduled_at ?? new Date().toISOString();
  await db.from('social_posts').update(patch).eq('id', id);
  revalidatePath('/admin/contenus');
}
