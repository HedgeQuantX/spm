import type { Metadata } from 'next';
import { WalletProvider } from '@/components/layout/wallet-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPM | Solana Prediction Markets',
  description: 'Trade prediction markets on Solana. Real-time, decentralized, and permissionless.',
  openGraph: {
    title: 'SPM | Solana Prediction Markets',
    description: 'Trade prediction markets on Solana.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPM | Solana Prediction Markets',
    description: 'Trade prediction markets on Solana.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <WalletProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
