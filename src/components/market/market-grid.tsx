'use client';

import { MarketCard } from './market-card';
import { MarketCardSkeleton } from '@/components/ui/skeleton';
import type { Market } from '@/types';

interface MarketGridProps {
  markets: Market[];
  loading: boolean;
}

export function MarketGrid({ markets, loading }: MarketGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MarketCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[#6b7db3] text-sm tracking-wider">NO MARKETS FOUND</p>
        <p className="text-[#4a5a8a] text-xs mt-1 tracking-wider">
          TRY ADJUSTING YOUR FILTERS OR CHECK BACK LATER
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {markets.map((market) => (
        <MarketCard key={market.publicKey.toBase58()} market={market} />
      ))}
    </div>
  );
}
