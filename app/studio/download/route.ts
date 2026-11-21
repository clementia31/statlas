// Téléchargement d'un visuel du Studio rangé sur un autre site (ex. myinvesta.fr).
// Le navigateur ignore l'attribut « download » d'un lien vers un autre domaine : il affiche l'image ou la vidéo au lieu de l'enregistrer.
// Cette route (privée, comme tout /studio) va chercher le fichier et le renvoie comme pièce à enregistrer, sous son nom.
// Seuls les sites de la maison sont acceptés, en https, pour ne pas servir de relais vers une adresse quelconque.
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const HOSTS = new Set(['myinvesta.fr', 'www.myinvesta.fr', 'statlasresearch.com', 'www.statlasresearch.com']);
const TYPES = /^(image|video)\//;

export async function GET(req: Request) {
  const asked = new URL(req.url).searchParams.get('url') ?? '';
  let target: URL;
  try {
    target = new URL(asked);
  } catch {
    return new Response('This file address is not valid.', { status: 400 });
  }
  if (target.protocol !== 'https:' || !HOSTS.has(target.hostname)) return new Response('This file is not on one of our sites.', { status: 400 });

  const upstream = await fetch(target, { redirect: 'error', cache: 'no-store' }).catch(() => null);
  if (!upstream || !upstream.ok) return new Response('The file could not be fetched. Try again in a moment.', { status: 502 });
  const type = upstream.headers.get('content-type') ?? '';
  if (!TYPES.test(type)) return new Response('This file is neither an image nor a video.', { status: 415 });

  // Nom du fichier : le dernier segment de l'adresse, réduit à des caractères sûrs.
  const name = (decodeURIComponent(target.pathname.split('/').pop() ?? '') || 'file').replace(/[^A-Za-z0-9._-]+/g, '-');
  const headers = new Headers({ 'content-type': type, 'content-disposition': `attachment; filename="${name}"`, 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' });
  // Le fichier est lu en entier puis renvoyé avec sa vraie taille : recopier la taille annoncée par le site d'origine
  // (qui peut être celle d'une version compressée) risquerait de livrer un fichier tronqué, illisible pour X ou Instagram.
  const bytes = await upstream.arrayBuffer();
  if (bytes.byteLength === 0) return new Response('The file came back empty. Try again in a moment.', { status: 502 });
  headers.set('content-length', String(bytes.byteLength));
  return new Response(bytes, { headers });
}
