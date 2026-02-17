'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatSol, formatCountdown } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProbabilityBar } from '@/components/ui/probability-bar';
import { IconClock, IconChart } from '@/components/icons';
import { MARKET_CATEGORIES_LABELS } from '@/config/constants';
import { calculateOdds } from '@/types/market';
import type { Market } from '@/types';

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const odds = calculateOdds(market);
  const sideAPercent = odds.sideABps / 100;

  return (
    <Link
      href={`/market/${market.publicKey.toBase58()}`}
      className={cn(
        'group block rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-5',
        'hover:border-cyan-400/20 hover:bg-[#0f1628]/80 transition-all duration-300',
        'hover:shadow-lg hover:shadow-cyan-400/5',
        'backdrop-blur-sm',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-[0.2em] text-[#6b7db3] font-semibold">
          {MARKET_CATEGORIES_LABELS[market.category]}
        </span>
        <StatusBadge status={market.status} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug tracking-wide">
        {market.title}
      </h3>

      {/* Probability */}
      <ProbabilityBar
        sideAPercent={sideAPercent}
        sideALabel={market.sideALabel || 'SIDE A'}
        sideBLabel={market.sideBLabel || 'SIDE B'}
        className="mb-4"
      />

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-[#6b7db3]">
        <div className="flex items-center gap-1.5">
          <IconChart size={12} className="text-violet-400" />
          <span className="font-mono tracking-wider">{formatSol(market.totalVolume)} SOL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <IconClock size={12} className="text-yellow-400" />
          <span className="font-mono tracking-wider">{formatCountdown(market.closesAt)}</span>
        </div>
      </div>
    </Link>
  );
}
