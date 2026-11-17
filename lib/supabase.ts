import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Durée pendant laquelle une lecture publique est gardée en mémoire par le site (en secondes).
// Sans cela, chaque page vue relance toutes ses requêtes : un robot qui parcourt le site suffit à saturer la base.
// La base ne change qu'aux imports : une heure de délai au plus avant qu'une nouvelle valeur apparaisse.
export const PUBLIC_CACHE_SECONDS = 3600;

// Seules les lectures (GET) sont gardées, sur toutes les pages publiques (vérifié : même celles en `force-dynamic`).
// Jamais de cache illimité. Le Studio lit toujours la base en direct (lib/supabase-admin.ts).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input: any, init?: any) => {
      const method = String(init?.method ?? 'GET').toUpperCase();
      return method === 'GET' || method === 'HEAD'
        ? fetch(input, { ...init, next: { revalidate: PUBLIC_CACHE_SECONDS } })
        : fetch(input, { ...init, cache: 'no-store' });
    },
  },
});

// Supabase renvoie au maximum 1000 lignes par requête : on pagine pour tout récupérer.
// build doit recréer la requête à chaque appel (avec un tri stable).
export async function fetchAllRows<T = any>(build: () => any, pageSize = 1000): Promise<{ data: T[]; error: any }> {
  const all: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build().range(from, from + pageSize - 1);
    if (error) return { data: all, error };
    const rows = (data ?? []) as T[];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return { data: all, error: null };
}

// Liste toutes les sources avec leurs documents, pour la page Bibliographie
export async function getAllSources() {
  const { data: sources, error } = await supabase
    .from('sources')
    .select('id, slug, name, source_type, url')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erreur getAllSources:', error.message);
    return [];
  }

  const { data: documents } = await supabase
    .from('source_documents')
    .select('id, source_id, title, url, published_at');

  const docsBySource = new Map<string, any[]>();
  for (const doc of documents ?? []) {
    if (!docsBySource.has(doc.source_id)) docsBySource.set(doc.source_id, []);
    docsBySource.get(doc.source_id)!.push(doc);
  }

  return (sources ?? []).map((s) => ({
    ...s,
    documents: docsBySource.get(s.id) ?? [],
  }));
}

export async function getArticleBySlug(slug: string) {
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !article) {
    if (error) console.error('Erreur getArticleBySlug:', error.message);
    return null;
  }

  let source: { name: string; url: string | null } | null = null;
  let doc: { title: string; url: string | null; published_at: string | null } | null = null;

  if (article.source_id) {
    const { data: sourceRow } = await supabase
      .from('sources')
      .select('id, name, url')
      .eq('id', article.source_id)
      .maybeSingle();
    if (sourceRow) {
      source = { name: sourceRow.name, url: sourceRow.url };
      const { data: docRow } = await supabase
        .from('source_documents')
        .select('title, url, published_at')
        .eq('source_id', sourceRow.id)
        .limit(1)
        .maybeSingle();
      if (docRow) doc = docRow;
    }
  }

  return { ...article, source, doc };
}
