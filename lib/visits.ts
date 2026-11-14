// Compteur de visites : règles communes (qui compter, comment nommer la provenance).
// Aucune donnée personnelle n'est conservée : seulement des totaux par jour.

export const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|pingdom|uptime|curl|wget|python|scrapy|httpclient|facebookexternalhit|whatsapp|telegram|discord|vercel/i;

export function projectOf(path: string): 'statlas' | 'gazette' {
  return path === '/gazette' || path.startsWith('/gazette/') ? 'gazette' : 'statlas';
}

// Adresse de la page, nettoyée : pas de paramètres, pas de barre finale, 200 caractères au plus.
export function cleanPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return null;
  let p = raw.split(/[?#]/)[0].slice(0, 200);
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (p === '/studio' || p.startsWith('/studio/') || p.startsWith('/api/') || p.startsWith('/_next/')) return null;
  return p || '/';
}

const KNOWN: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/^(t\.co|x\.com|twitter\.com|mobile\.twitter\.com)$/, 'X'],
  [/(^|\.)facebook\.com$/, 'Facebook'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'LinkedIn'],
  [/(^|\.)reddit\.com$/, 'Reddit'],
  [/(^|\.)youtube\.com$/, 'YouTube'],
];
const TAGGED: Record<string, string> = { instagram: 'Instagram', ig: 'Instagram', x: 'X', twitter: 'X', google: 'Google', linkedin: 'LinkedIn', facebook: 'Facebook', reddit: 'Reddit', youtube: 'YouTube' };

// D'où vient la visite : étiquette du lien (utm_source) si elle existe, sinon le site d'origine.
export function sourceOf(referrer: unknown, tag: unknown, ownHost: string, entry: boolean): string {
  if (!entry) return 'internal';
  if (typeof tag === 'string' && tag.trim()) {
    const t = tag.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);
    if (t) return TAGGED[t] ?? t;
  }
  if (typeof referrer !== 'string' || !referrer) return 'direct';
  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'direct';
  }
  if (!host) return 'direct';
  if (host === ownHost.toLowerCase().replace(/^www\./, '').split(':')[0]) return 'internal';
  for (const [re, name] of KNOWN) if (re.test(host)) return name;
  return host.slice(0, 80);
}
