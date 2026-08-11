import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Statlas — Statistiques mondiales sourcées',
  description: 'Bibliothèque mondiale de statistiques sourcées : classements, cartes, comparaisons.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  );
}
