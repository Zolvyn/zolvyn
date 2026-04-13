import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  // ── Basic ──────────────────────────────────────────────────────────────────
  title: {
    default: 'Zolvyn AI — India\'s Most Advanced Legal Intelligence Platform',
    template: '%s | Zolvyn AI',
  },
  description:
    'Zolvyn gives every Indian access to expert legal intelligence. Ask any Indian law question, analyze contracts, generate court-ready documents, and predict case outcomes — free to start.',

  // ── Keywords ───────────────────────────────────────────────────────────────
  keywords: [
    'Indian legal AI',
    'AI lawyer India',
    'legal assistant India',
    'contract analyzer India',
    'legal document generator India',
    'Indian law chatbot',
    'case predictor India',
    'bare act search India',
    'IPC sections',
    'BNS 2023',
    'legal help India free',
    'know your rights India',
    'legal AI platform India',
    'Zolvyn',
    'Zolvyn AI',
  ],

  // ── Canonical & Author ─────────────────────────────────────────────────────
  metadataBase: new URL('https://zolvyn.vercel.app'),
  alternates: {
    canonical: '/',
  },
  authors: [{ name: 'Zolvyn AI', url: 'https://zolvyn.vercel.app' }],
  creator: 'Zolvyn AI',
  publisher: 'Zolvyn AI',

  // ── Open Graph (WhatsApp / Facebook link previews) ─────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://zolvyn.vercel.app',
    siteName: 'Zolvyn AI',
    title: 'Zolvyn AI — Know Your Rights. Instantly.',
    description:
      'India\'s most advanced legal AI platform. Get expert legal answers, analyze contracts, generate documents, and predict case outcomes — free to start.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zolvyn AI — India\'s Legal Intelligence Platform',
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Zolvyn AI — Know Your Rights. Instantly.',
    description:
      'India\'s most advanced legal AI platform. Free to start. Ask any Indian law question and get expert answers instantly.',
    images: ['/og-image.png'],
  },

  // ── Robots ────────────────────────────────────────────────────────────────
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

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // ── Google Search Console Verification ────────────────────────────────────
  // Step: Go to search.google.com/search-console → add site → get code → paste below
  verification: {
    google: 'PASTE_YOUR_GOOGLE_VERIFICATION_CODE_HERE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* JSON-LD Structured Data — tells Google exactly what Zolvyn is */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Zolvyn AI',
                url: 'https://zolvyn.vercel.app',
                description:
                  'India\'s most advanced legal AI platform. Get expert legal answers, analyze contracts, generate court-ready documents, and predict case outcomes.',
                applicationCategory: 'LegalApplication',
                operatingSystem: 'Web',
                inLanguage: 'en-IN',
                availableCountry: 'IN',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'INR',
                  description: 'Free plan available',
                },
                featureList: [
                  'Legal Q&A with Indian law references',
                  'Contract Analyzer with risk scoring',
                  'Legal Document Generator',
                  'Case Predictor with win probability',
                  'Bare Act Search',
                ],
              }),
            }}
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}