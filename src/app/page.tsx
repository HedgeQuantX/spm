'use client';

import { useState } from 'react';
import { useMarkets } from '@/hooks/use-markets';
import { MarketFilters } from '@/components/market/market-filters';
import { MarketGrid } from '@/components/market/market-grid';
import { IconTrending } from '@/components/icons';
import type { MarketFilter } from '@/types';

const DEFAULT_FILTER: MarketFilter = {
  category: null,
  status: null,
  search: '',
  sortBy: 'volume',
};

export default function HomePage() {
  const [filter, setFilter] = useState<MarketFilter>(DEFAULT_FILTER);
  const { markets, allMarkets, loading, error } = useMarkets(filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IconTrending size={24} className="text-violet-400" />
          <h1 className="text-2xl font-bold text-white">Markets</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Trade predictions on real-world events, powered by Solana.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <MarketFilters
          filter={filter}
          onChange={setFilter}
          totalCount={allMarkets.length}
        />
      </div>

      {/* Grid */}
      <MarketGrid markets={markets} loading={loading} />
    </div>
  );
}
