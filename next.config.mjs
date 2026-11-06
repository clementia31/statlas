/** @type {import('next').NextConfig} */
const gazetteHosts = ['statlasgazette.com', 'www.statlasgazette.com'];

const nextConfig = {
  async redirects() {
    // statlasgazette.com → la Gazette sur le site principal (redirection permanente, chemin conservé)
    return gazetteHosts.flatMap((host) => [
      { source: '/', has: [{ type: 'host', value: host }], destination: 'https://www.statlasresearch.com/gazette', permanent: true },
      { source: '/:path+', has: [{ type: 'host', value: host }], destination: 'https://www.statlasresearch.com/gazette/:path+', permanent: true },
    ]);
  },
};
export default nextConfig;
