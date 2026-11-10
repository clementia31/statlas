import StudioShell, { Eyebrow } from '@/components/studio/Shell';

export const metadata = { title: 'Organisation · Studio', robots: { index: false, follow: false } };

const BRANDS = [
  {
    name: 'Finalea', color: '#B4530F', tag: 'Finance · personal research',
    parts: ['Market research', 'Behavioural index', "John's page"],
    domains: [['finalea.fr', 'main', true], ['studio.finalea.fr', 'Studio (private) · to connect', false]],
  },
  {
    name: 'Statlas', color: '#1F4FD1', tag: 'World statistics',
    parts: ['Statlas site', 'The Gazette', 'Lists', 'Statlas Research'],
    domains: [['statlasresearch.com', 'main site', true], ['statlas.fr', 'redirect', false], ['statlas.eu', 'redirect', false], ['statlas.de', 'redirect', false], ['statlasgazette.com', 'redirects to the Gazette', false]],
  },
  {
    name: 'MyInvesta', color: '#1C7C4A', tag: 'Rental management app',
    parts: ['Owner app', 'Tenant space', 'Property statistics'],
    domains: [['myinvesta.fr', 'app and site', true], ['contact@myinvesta.fr', 'mailbox', false]],
  },
] as const;

const STORES = [
  { name: 'Common database', sub: 'Supabase · online', badge: 'Public data', pub: true, items: ['Countries, cities, currencies, sources and licences', 'Statlas indicators and lists', 'Gazette articles and quotes', 'Import log and Studio calendar (private tables)'] },
  { name: 'Finalea database', sub: 'Supabase · separate personal account', badge: 'Private', pub: false, items: ['Signals and test results', 'Reads the common database remotely', 'Market prices are never republished'] },
  { name: 'MyInvesta database', sub: 'Supabase · separate', badge: 'Private', pub: false, items: ['Client accounts, properties, leases, rents', 'Sends totals only to Studio', 'No bracket under five clients'] },
  { name: 'External disk', sub: 'DuckDB · offline', badge: 'Private', pub: false, items: ['Offline copy of the common database', 'Dated backups, encrypted for client data', 'Raw data too large to keep online'] },
];

export default function OrganisationPage() {
  return (
    <StudioShell active="Organisation">
      <Eyebrow>Organisation</Eyebrow>
      <h1 className="mt-1 font-serif text-[34px] font-bold leading-tight sm:text-[40px]">How the projects fit together</h1>
      <p className="mt-2 text-[15.5px] text-textSecondary">Three brands, one private Studio, and where each kind of data lives.</p>

      <div className="mx-auto mt-7 w-full max-w-[340px] rounded-lg bg-text px-6 py-3.5 text-center text-white">
        <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">Owner</div>
        <div className="font-serif text-[21px] font-semibold">Clem</div>
      </div>
      <div className="mx-auto h-6 w-0.5 bg-text" />
      <div className="mx-auto hidden h-0.5 w-2/3 bg-text lg:block" />

      <div className="grid gap-5 lg:grid-cols-3">
        {BRANDS.map((b) => (
          <div key={b.name} className="rounded-xl border border-border bg-panel px-5 py-4" style={{ borderTop: `5px solid ${b.color}` }}>
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: b.color }}>{b.tag}</div>
            <div className="mt-1 font-serif text-[27px] font-semibold">{b.name}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {b.parts.map((x) => <span key={x} className="inline-flex h-7 items-center rounded-full bg-panel2 px-2.5 text-[12.5px]">{x}</span>)}
            </div>
            <div className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">Domains</div>
            <ul>
              {b.domains.map(([d, role, main]) => (
                <li key={d} className="flex justify-between gap-3 border-b border-panel2 py-1.5">
                  <span className={`break-all font-mono text-[13px] ${main ? 'font-semibold' : ''}`}>{d}</span>
                  <span className="text-right text-[12.5px] text-textMuted">{role}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto h-6 w-0.5 bg-text" />
      <div className="mx-auto w-full max-w-[680px] rounded-xl border border-[#C9D7F8] bg-[#EDF2FE] px-6 py-4 text-center">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">Private admin · your account only</div>
        <div className="font-serif text-[25px] font-semibold">Studio</div>
        <div className="text-[14px] text-textSecondary">Editorial calendar · publications to download · metrics · this page</div>
      </div>
      <div className="mx-auto h-6 w-0.5 bg-text" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STORES.map((s) => (
          <div key={s.name} className="rounded-xl border border-border bg-panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[16px] font-semibold">{s.name}</div>
              <span className={`shrink-0 rounded px-2 py-0.5 text-[11.5px] font-semibold ${s.pub ? 'bg-[#E3F3EA] text-green' : 'bg-[#FBE9E7] text-red'}`}>{s.badge}</span>
            </div>
            <div className="text-[12.5px] text-textMuted">{s.sub}</div>
            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[13.5px] text-textSecondary">{s.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-textMuted">All project mail addresses forward to one central project mailbox. A database change is a numbered file in the code repository, tested before it is run.</p>
    </StudioShell>
  );
}
