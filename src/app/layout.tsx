import type { Metadata } from 'next';
import { WalletProvider } from '@/components/layout/wallet-provider';
import './globals.css';

const SITE_URL = 'https://spm.hedgequantx.com';

export const metadata: Metadata = {
  title: 'SPM | SOLANA PREDICTION MARKETS',
  description: 'Trade prediction markets on Solana. Fully on-chain, permissionless, real-time. 83+ markets across crypto, politics, sports, tech, science.',
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'SPM | SOLANA PREDICTION MARKETS',
    description: 'Trade prediction markets on Solana. Fully on-chain, permissionless, real-time.',
    url: SITE_URL,
    siteName: 'SPM',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'SPM - Solana Prediction Markets',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPM | SOLANA PREDICTION MARKETS',
    description: 'Trade prediction markets on Solana. Fully on-chain, permissionless, real-time.',
    images: ['/og.png'],
    creator: '@hedgequantx',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0a0e1a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
