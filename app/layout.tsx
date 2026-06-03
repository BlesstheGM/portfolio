import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blessing Hlongwane — Backend Developer',
  description:
    'Portfolio of Blessing Hlongwane — Backend Developer building REST APIs, data pipelines, and real-time systems.',
  keywords: ['Backend Developer', 'Python', 'Java', 'FastAPI', 'REST APIs', 'AWS', 'Cape Town', 'Blessing Hlongwane'],
  authors: [{ name: 'Blessing Hlongwane', url: 'https://github.com/BlesstheGM' }],
  openGraph: {
    title: 'Blessing Hlongwane — Backend Developer',
    description: 'Backend Developer building REST APIs, data pipelines, and real-time systems.',
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
