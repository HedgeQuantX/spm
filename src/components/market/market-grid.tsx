'use client';

import { MarketCard } from './market-card';
import { MarketCardSkeleton } from '@/components/ui/skeleton';
import type { Market } from '@/types';

interface MarketGridProps {
  markets: Market[];
  loading: boolean;
  onSelectMarket: (market: Market) => void;
}

export function MarketGrid({ markets, loading, onSelectMarket }: MarketGridProps) {
  if (loading) {
    return (
      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MarketCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[#6b7db3] text-xs tracking-wider">NO MARKETS FOUND</p>
        <p className="text-[#4a5a8a] text-[10px] mt-1 tracking-wider">
          TRY ADJUSTING YOUR FILTERS OR CHECK BACK LATER
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {markets.map((market) => (
        <MarketCard
          key={market.publicKey.toBase58()}
          market={market}
          onSelect={onSelectMarket}
        />
      ))}
    </div>
  );
}
