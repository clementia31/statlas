/** @type {import('next').NextConfig} */
const gazetteHosts = ['statlasgazette.com', 'www.statlasgazette.com'];

const nextConfig = {
  async redirects() {
    // statlasgazette.com → la Gazette sur le site principal (redirection permanente, chemin conservé)
    const gazette = gazetteHosts.flatMap((host) => [
      { source: '/', has: [{ type: 'host', value: host }], destination: 'https://www.statlasresearch.com/gazette', permanent: true },
      { source: '/:path+', has: [{ type: 'host', value: host }], destination: 'https://www.statlasresearch.com/gazette/:path+', permanent: true },
    ]);
    // L'ancien espace /admin est fusionné dans le Studio (les anciens liens, clé comprise, continuent de fonctionner)
    const admin = [
      { source: '/admin', destination: '/studio/articles', permanent: false },
      { source: '/admin/contenus', destination: '/studio', permanent: false },
      { source: '/admin/export-articles', destination: '/studio/export-articles', permanent: false },
      { source: '/admin/brouillon/:lang/:slug', destination: '/studio/articles/:lang/:slug', permanent: false },
    ];
    // Adresses passées en anglais (nov. 2026) : les anciennes adresses françaises redirigent définitivement, paramètres conservés
    const english = [
      ['pays', 'countries'],
      ['indicateurs', 'indicators'],
      ['carte', 'map'],
      ['comparaisons', 'compare'],
      ['bibliographie', 'bibliography'],
    ].flatMap(([from, to]) => [
      { source: `/${from}`, destination: `/${to}`, permanent: true },
      { source: `/${from}/:path*`, destination: `/${to}/:path*`, permanent: true },
    ]);
    // Sur un domaine studio.* (ex. studio.finalea.fr), l'accueil mène directement au Studio
    const studio = [{ source: '/', has: [{ type: 'host', value: 'studio\\..*' }], destination: '/studio', permanent: false }];
    return [...gazette, ...admin, ...english, ...studio];
  },
  // Les pages publiques sont préparées à l'avance (statiques, renouvelées chaque heure). Quand l'adresse porte un paramètre
  // (?year=, ?indicator=…), la demande est servie par la page jumelle sous /q, calculée à la demande. L'adresse visible ne change pas.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', has: [{ type: 'query', key: 'indicator' }], destination: '/q/overview' },
        { source: '/', has: [{ type: 'query', key: 'year' }], destination: '/q/overview' },
        { source: '/indicators', has: [{ type: 'query', key: 'indicator' }], destination: '/q/indicators' },
        { source: '/indicators', has: [{ type: 'query', key: 'year' }], destination: '/q/indicators' },
        { source: '/indicators', has: [{ type: 'query', key: 'tab' }], destination: '/q/indicators' },
        { source: '/map', has: [{ type: 'query', key: 'indicator' }], destination: '/q/map' },
        { source: '/compare', has: [{ type: 'query', key: 'indicator' }], destination: '/q/compare' },
        { source: '/compare', has: [{ type: 'query', key: 'countries' }], destination: '/q/compare' },
        { source: '/benchmark', has: [{ type: 'query', key: 'countries' }], destination: '/q/benchmark' },
        { source: '/benchmark', has: [{ type: 'query', key: 'mode' }], destination: '/q/benchmark' },
        { source: '/benchmark', has: [{ type: 'query', key: 'preset' }], destination: '/q/benchmark' },
        { source: '/benchmark', has: [{ type: 'query', key: 'view' }], destination: '/q/benchmark' },
        { source: '/bibliography', has: [{ type: 'query', key: 'q' }], destination: '/q/bibliography' },
        { source: '/gazette/archive', has: [{ type: 'query', key: 'year' }], destination: '/q/gazette-archive' },
        { source: '/gazette/archive', has: [{ type: 'query', key: 'domain' }], destination: '/q/gazette-archive' },
        { source: '/gazette/archive', has: [{ type: 'query', key: 'type' }], destination: '/q/gazette-archive' },
        { source: '/rankings/:slug', has: [{ type: 'query', key: 'year' }], destination: '/q/rankings/:slug' },
        { source: '/countries/:slug', has: [{ type: 'query', key: 'trend' }], destination: '/q/countries/:slug' },
      ],
    };
  },
};
export default nextConfig;
