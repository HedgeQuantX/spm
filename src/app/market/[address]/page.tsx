'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMarketDetail } from '@/hooks/use-market-detail';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProbabilityBar } from '@/components/ui/probability-bar';
import { MarketDetailSkeleton } from '@/components/ui/skeleton';
import { MarketStats } from '@/components/market/market-stats';
import { TradePanel } from '@/components/market/trade-panel';
import { TradeHistory } from '@/components/market/trade-history';
import { IconExternalLink } from '@/components/icons';
import { MARKET_CATEGORIES_LABELS } from '@/config/constants';
import { truncateAddress } from '@/lib/format';

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function MarketDetailPage({ params }: PageProps) {
  const { address } = use(params);
  const { market, trades, loading, error } = useMarketDetail(address);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <MarketDetailSkeleton />
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center py-20">
          <p className="text-zinc-500 text-sm">{error ?? 'Market not found'}</p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Markets
        </Link>
        <span>/</span>
        <span className="text-zinc-400">
          {MARKET_CATEGORIES_LABELS[market.category]}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={market.status} />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                {MARKET_CATEGORIES_LABELS[market.category]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              {market.title}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {market.description}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
              <span className="font-mono">{truncateAddress(market.publicKey.toBase58(), 6)}</span>
              <a
                href={`https://solscan.io/account/${market.publicKey.toBase58()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <IconExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Probability */}
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5">
            <ProbabilityBar yesPercent={market.outcomes[0].probability} />
          </div>

          {/* Stats */}
          <MarketStats market={market} />

          {/* Trade History */}
          <TradeHistory trades={trades} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TradePanel market={market} />
        </div>
      </div>
    </div>
  );
}
