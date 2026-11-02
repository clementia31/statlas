import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://statlas-inky.vercel.app'),
  title: {
    default: 'Statlas — Sourced world statistics',
    template: '%s',
  },
  description:
    'Free, sourced statistics on every country: GDP, population, human development, inequality, inflation and more — harmonised from the IMF, UNDP, OECD and UN.',
  openGraph: {
    title: 'Statlas — Sourced world statistics',
    description: 'Free, sourced statistics on every country, harmonised from the IMF, UNDP, OECD and UN.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#F7F5EF',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
