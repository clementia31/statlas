import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Pas de cache Next.js sur les requêtes Supabase : le site affiche toujours l'état actuel de la base
// (sinon Vercel peut servir indéfiniment d'anciennes réponses, même après un redéploiement).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input: any, init?: any) => fetch(input, { ...init, cache: 'no-store' }),
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
