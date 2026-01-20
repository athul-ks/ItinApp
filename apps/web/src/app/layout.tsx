import { Suspense } from 'react';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';

import { AuthModal } from '@/components/auth-modal';
import Footer from '@/components/footer';
import { TRPCReactProvider } from '@/trpc/react';

import Header from '../components/header';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://itinapp.athulk.dev'),
  title: {
    default: 'ItinApp | Personalised AI Travel Itineraries',
    template: '%s | ItinApp',
  },
  description:
    'Generate day-by-day travel plans in seconds using AI. Get personalised routes, budget-friendly activities, and beautiful maps.',
  keywords: ['AI Travel Planner', 'Travel Itinerary Generator', 'Personalised Travel', 'ItinApp'],
  authors: [{ name: 'ItinApp Team' }],
  creator: 'ItinApp',
  publisher: 'ItinApp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://itinapp.athulk.dev',
    siteName: 'ItinApp',
    title: 'ItinApp | Personalised AI Travel Itineraries',
    description: 'Plan your next adventure with the power of AI.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ItinApp - Your AI Travel Partner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ItinApp | AI Travel Planning',
    description: 'The smartest way to plan your next trip.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>
          <TRPCReactProvider>
            <Header />
            <div className="flex w-full flex-1 flex-col">{children}</div>
            <Analytics />
            <SpeedInsights />
            <Suspense fallback={null}>
              <AuthModal />
            </Suspense>
            <Footer />
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
