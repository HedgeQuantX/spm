'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatAmount, formatCountdown } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProbabilityBar } from '@/components/ui/probability-bar';
import { IconClock, IconChart } from '@/components/icons';
import { MARKET_CATEGORIES_LABELS } from '@/config/constants';
import type { Market } from '@/types';

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const yesProb = market.outcomes[0].probability;

  return (
    <Link
      href={`/market/${market.publicKey.toBase58()}`}
      className={cn(
        'group block rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5',
        'hover:border-zinc-700/50 hover:bg-zinc-900/50 transition-all duration-300',
        'hover:shadow-lg hover:shadow-zinc-900/50',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
          {MARKET_CATEGORIES_LABELS[market.category]}
        </span>
        <StatusBadge status={market.status} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-zinc-100 transition-colors leading-snug">
        {market.title}
      </h3>

      {/* Probability */}
      <ProbabilityBar yesPercent={yesProb} className="mb-4" />

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <IconChart size={12} />
          <span className="font-mono">${formatAmount(market.totalVolume)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <IconClock size={12} />
          <span className="font-mono">{formatCountdown(market.closesAt)}</span>
        </div>
      </div>
    </Link>
  );
}
