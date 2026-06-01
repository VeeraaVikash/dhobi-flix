import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';

/* ── Fonts ─────────────────────────────────────────────────────────────────── */

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

/* ── Metadata ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: 'DhobiFlix — Stream Movies & TV',
    template: '%s | DhobiFlix',
  },
  description:
    'DhobiFlix is a Netflix-inspired streaming platform demo built with Next.js, TMDB API, and adaptive bitrate playback simulation.',
  keywords: [
    'DhobiFlix',
    'streaming',
    'movies',
    'TV shows',
    'TMDB',
    'Next.js',
  ],
  authors: [{ name: 'DhobiFlix Team' }],
  metadataBase: new URL('https://dhobiflix.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'DhobiFlix',
    title: 'DhobiFlix — Stream Movies & TV',
    description:
      'A Netflix-inspired streaming UI demo with TMDB integration, ABR simulation, and dark cinematic design.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/* ── Layout ────────────────────────────────────────────────────────────────── */

import AuthProvider from '@/components/auth/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <AuthProvider>
          {/* Top navigation */}
          <Navbar />

          {/* Page content */}
          <div className="flex-1">{children}</div>

          {/* Bottom mobile navigation */}
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
