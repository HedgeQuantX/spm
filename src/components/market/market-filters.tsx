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
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search markets..."
            value={filter.search}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <IconFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <select
            value={filter.sortBy}
            onChange={(e) =>
              onChange({ ...filter, sortBy: e.target.value as MarketFilter['sortBy'] })
            }
            className="appearance-none pl-9 pr-8 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
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
            'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
            !filter.category
              ? 'bg-white text-black'
              : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50',
          )}
        >
          All ({totalCount})
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
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              filter.category === cat
                ? 'bg-white text-black'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50',
            )}
          >
            {MARKET_CATEGORIES_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
