// Rendu du corps d'un article de la Gazette.
// Format simple : paragraphes séparés par une ligne vide ;
// « ## Titre » = intertitre ; « > citation » suivi d'une ligne « — Auteur » = citation mise en exergue.

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'quote'; text: string; cite: string | null };

export function parseBody(body: string | null | undefined): Block[] {
  if (!body) return [];
  return body
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b): Block => {
      if (b.startsWith('## ')) return { kind: 'h', text: b.slice(3).trim() };
      if (b.startsWith('> ')) {
        const lines = b.split('\n');
        const citeIdx = lines.findIndex((l) => /^[—–-]\s/.test(l.trim()));
        const quoteLines = citeIdx === -1 ? lines : lines.slice(0, citeIdx);
        const cite = citeIdx === -1 ? null : lines.slice(citeIdx).join(' ').trim().replace(/^[—–-]\s*/, '');
        return { kind: 'quote', text: quoteLines.map((l) => l.replace(/^>\s?/, '')).join(' ').trim(), cite };
      }
      return { kind: 'p', text: b.replace(/\n/g, ' ') };
    });
}

// Premiers paragraphes (avant le premier intertitre) — pour la une
export function leadText(body: string | null | undefined, max = 520) {
  const lead: string[] = [];
  for (const b of parseBody(body)) {
    if (b.kind !== 'p') break;
    lead.push(b.text);
  }
  const t = lead.join(' ');
  return t.length > max ? t.slice(0, t.lastIndexOf(' ', max)) + '…' : t;
}

const DROP_CAP =
  'first-letter:float-left first-letter:font-headline first-letter:font-extrabold first-letter:text-[76px] sm:first-letter:text-[84px] first-letter:leading-[0.8] first-letter:pr-2.5 first-letter:pt-2';

export default function ArticleBody({ body }: { body: string | null | undefined }) {
  const blocks = parseBody(body);
  let firstParagraphDone = false;
  return (
    <div className="font-serif text-[18px] sm:text-[19px] leading-[1.7]">
      {blocks.map((b, i) => {
        if (b.kind === 'h') {
          return (
            <h2 key={i} className="mt-12 mb-1 border-t border-ink pt-4 font-headline text-[26px] sm:text-[30px] font-extrabold leading-tight">
              {b.text}
            </h2>
          );
        }
        if (b.kind === 'quote') {
          return (
            <figure key={i} className="my-10 border-y-[3px] border-double border-ink py-6 text-center">
              <blockquote className="font-headline italic text-[22px] sm:text-[27px] leading-snug">“{b.text}”</blockquote>
              {b.cite && <figcaption className="mt-3 font-sans text-[12px] uppercase tracking-[0.12em] text-inkMuted">{b.cite}</figcaption>}
            </figure>
          );
        }
        const cls = !firstParagraphDone ? `mt-5 ${DROP_CAP}` : 'mt-5';
        firstParagraphDone = true;
        return (
          <p key={i} className={cls}>
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
