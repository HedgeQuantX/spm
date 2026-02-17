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
        <p className="text-zinc-500 text-sm">No markets found</p>
        <p className="text-zinc-600 text-xs mt-1">
          Try adjusting your filters or check back later
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
