'use client';

import { cn } from '@/lib/cn';
import { IconSearch, IconFilter } from '@/components/icons';
import {
  MARKET_CATEGORIES_LABELS,
  SORT_OPTIONS,
} from '@/config/constants';
import { MarketCategory, type MarketFilter } from '@/types';

interface MarketFiltersProps {
  filter: MarketFilter;
  onChange: (filter: MarketFilter) => void;
  totalCount: number;
}

export function MarketFilters({ filter, onChange, totalCount }: MarketFiltersProps) {
  const categories = Object.values(MarketCategory);

  return (
    <div className="space-y-4">
      {/* Search + Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7db3]" />
          <input
            type="text"
            placeholder="SEARCH MARKETS..."
            value={filter.search}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0f1628]/80 border border-cyan-400/10 text-sm text-white placeholder:text-[#4a5a8a] focus:outline-none focus:border-cyan-400/30 transition-colors tracking-wider"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <IconFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7db3]" />
          <select
            value={filter.sortBy}
            onChange={(e) =>
              onChange({ ...filter, sortBy: e.target.value as MarketFilter['sortBy'] })
            }
            className="appearance-none pl-9 pr-8 py-2.5 rounded-lg bg-[#0f1628]/80 border border-cyan-400/10 text-sm text-white focus:outline-none focus:border-cyan-400/30 transition-colors cursor-pointer tracking-wider"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onChange({ ...filter, category: null })}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-[0.15em] whitespace-nowrap transition-all',
            !filter.category
              ? 'bg-cyan-400 text-[#060a14]'
              : 'text-[#6b7db3] hover:text-cyan-400 hover:bg-cyan-400/5',
          )}
        >
          ALL ({totalCount})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              onChange({
                ...filter,
                category: filter.category === cat ? null : cat,
              })
            }
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-[0.15em] whitespace-nowrap transition-all',
              filter.category === cat
                ? 'bg-cyan-400 text-[#060a14]'
                : 'text-[#6b7db3] hover:text-cyan-400 hover:bg-cyan-400/5',
            )}
          >
            {MARKET_CATEGORIES_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
