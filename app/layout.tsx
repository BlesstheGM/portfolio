import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'shop.agent — AI Shopping Agent by Blessing Hlongwane',
  description:
    'A live AI shopping agent: real product search, tool-calling agent, and WhatsApp order updates. Built with Next.js, TypeScript, the Vercel AI SDK, Gemini, Supabase, and Twilio.',
  keywords: [
    'AI Agent',
    'Tool Calling',
    'Vercel AI SDK',
    'Next.js',
    'TypeScript',
    'Supabase',
    'WhatsApp API',
    'Blessing Hlongwane',
  ],
  authors: [{ name: 'Blessing Hlongwane', url: 'https://github.com/BlesstheGM' }],
  openGraph: {
    title: 'shop.agent — AI Shopping Agent by Blessing Hlongwane',
    description: 'Real product search, agentic tool-calling, and WhatsApp order updates — live demo.',
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
