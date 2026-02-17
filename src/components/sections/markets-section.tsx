'use client';

import { useState } from 'react';
import { useMarkets } from '@/hooks/use-markets';
import { MarketFilters } from '@/components/market/market-filters';
import { MarketGrid } from '@/components/market/market-grid';
import type { Market, MarketFilter } from '@/types';

interface MarketsSectionProps {
  onSelectMarket: (market: Market) => void;
}

export function MarketsSection({ onSelectMarket }: MarketsSectionProps) {
  const [filter, setFilter] = useState<MarketFilter>({
    category: null,
    status: null,
    search: '',
    sortBy: 'trending',
  });

  const { markets, allMarkets, loading, error } = useMarkets(filter);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Filters — sticky top */}
      <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 border-b border-cyan-400/5">
        <MarketFilters
          filter={filter}
          onChange={setFilter}
          totalCount={allMarkets.length}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="shrink-0 mx-3 sm:mx-4 mt-2 px-3 py-2 border border-[#e63973]/20 bg-[#e63973]/5 text-[11px] text-[#e63973] tracking-wider">
          {error}
        </div>
      )}

      {/* Grid — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3">
        <MarketGrid
          markets={markets}
          loading={loading}
          onSelectMarket={onSelectMarket}
        />
      </div>
    </div>
  );
}
