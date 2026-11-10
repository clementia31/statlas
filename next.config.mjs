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
    return [...gazette, ...admin];
  },
};
export default nextConfig;
