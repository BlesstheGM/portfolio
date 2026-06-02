import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blessing Hlongwane — Data Scientist & Engineer',
  description:
    'Portfolio of Blessing Hlongwane — Data Scientist, trading systems engineer, and full-stack developer based in Cape Town.',
  keywords: ['Data Scientist', 'Python', 'AWS', 'Next.js', 'Cape Town', 'Blessing Hlongwane'],
  authors: [{ name: 'Blessing Hlongwane', url: 'https://github.com/BlesstheGM' }],
  openGraph: {
    title: 'Blessing Hlongwane — Data Scientist & Engineer',
    description: 'Data Scientist, trading systems engineer, and full-stack developer based in Cape Town.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
