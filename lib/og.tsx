import { ImageResponse } from 'next/og';

// Image d'aperçu (1200 × 630) affichée quand un lien du site est partagé sur X, LinkedIn, WhatsApp, etc.
// Même identité que le site : fond clair, titre fort, source toujours visible.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = 'image/png';

type Row = { rank: string; label: string; value: string };

export function ogImage({ kicker, title, subtitle, rows, footer, brand = 'STATLAS' }: { kicker: string; title: string; subtitle?: string; rows?: Row[]; footer?: string; brand?: string }) {
  const size = title.length > 60 ? 50 : title.length > 36 ? 62 : 76;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#F7F5EF', color: '#15171A', padding: '56px 64px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>{brand}</div>
          <div style={{ display: 'flex', fontSize: 20, color: '#1F4FD1', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>{kicker}</div>
        </div>
        <div style={{ display: 'flex', height: 4, width: 120, background: '#15171A', marginTop: 18 }} />
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: size, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
          {subtitle ? <div style={{ display: 'flex', marginTop: 18, fontSize: 28, color: '#3F4550', lineHeight: 1.3 }}>{subtitle}</div> : null}
          {rows && rows.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 30, borderTop: '2px solid #15171A' }}>
              {rows.map((r) => (
                <div key={r.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #DEDAD0', fontSize: 30 }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', width: 50, color: '#5B6270' }}>{r.rank}</div>
                    <div style={{ display: 'flex', fontWeight: 700 }}>{r.label}</div>
                  </div>
                  <div style={{ display: 'flex' }}>{r.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#5B6270' }}>
          <div style={{ display: 'flex' }}>{footer ?? 'Free, sourced world statistics'}</div>
          <div style={{ display: 'flex' }}>statlasresearch.com</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
