import { OG_SIZE, OG_TYPE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'Statlas — Sourced world statistics';

export default function Image() {
  return ogImage({ kicker: 'World statistics', title: 'Sourced statistics on every country', subtitle: 'Rankings, country profiles and maps, with the source of every figure.' });
}
