import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { WalletProvider } from '@/components/layout/wallet-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <WalletProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
