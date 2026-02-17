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
import { calculateOdds } from '@/types/market';

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function MarketDetailPage({ params }: PageProps) {
  const { address } = use(params);
  const { market, bets, loading, error } = useMarketDetail(address);

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
          <p className="text-[#6b7db3] text-sm tracking-wider">{error ?? 'MARKET NOT FOUND'}</p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors tracking-wider"
          >
            BACK TO MARKETS
          </Link>
        </div>
      </div>
    );
  }

  const odds = calculateOdds(market);
  const sideAPercent = odds.sideABps / 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6b7db3] mb-6 tracking-wider">
        <Link href="/" className="hover:text-cyan-400 transition-colors">
          MARKETS
        </Link>
        <span>/</span>
        <span className="text-[#8b9ed3]">
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
              <span className="text-[10px] tracking-[0.2em] text-[#6b7db3]">
                {MARKET_CATEGORIES_LABELS[market.category]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2 tracking-wide">
              {market.title}
            </h1>
            <p className="text-sm text-[#8b9ed3] leading-relaxed normal-case">
              {market.description}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#4a5a8a]">
              <span className="font-mono">{truncateAddress(market.publicKey.toBase58(), 6)}</span>
              <a
                href={`https://solscan.io/account/${market.publicKey.toBase58()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors"
              >
                <IconExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Probability */}
          <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-5">
            <ProbabilityBar
              sideAPercent={sideAPercent}
              sideALabel={market.sideALabel || 'SIDE A'}
              sideBLabel={market.sideBLabel || 'SIDE B'}
            />
          </div>

          {/* Stats */}
          <MarketStats market={market} />

          {/* Bet History */}
          <TradeHistory bets={bets} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TradePanel market={market} />
        </div>
      </div>
    </div>
  );
}
