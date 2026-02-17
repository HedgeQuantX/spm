'use client';

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
  onSelect: (market: Market) => void;
}

export function MarketCard({ market, onSelect }: MarketCardProps) {
  const odds = calculateOdds(market);
  const sideAPercent = odds.sideABps / 100;

  return (
    <button
      onClick={() => onSelect(market)}
      className={cn(
        'hud-corners group block w-full text-left p-3 sm:p-4',
        'border border-cyan-400/8 bg-[#0f1628]/60',
        'hover:border-cyan-400/20 hover:bg-[#0f1628]/80 transition-all duration-200',
        'hover:shadow-lg hover:shadow-cyan-400/5',
        'backdrop-blur-sm cursor-pointer',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] tracking-[0.2em] text-[#6b7db3] font-bold">
          {MARKET_CATEGORIES_LABELS[market.category]}
        </span>
        <StatusBadge status={market.status} />
      </div>

      {/* Title */}
      <h3 className="text-[13px] sm:text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug tracking-wide">
        {market.title}
      </h3>

      {/* Probability */}
      <ProbabilityBar
        sideAPercent={sideAPercent}
        sideALabel={market.sideALabel || 'SIDE A'}
        sideBLabel={market.sideBLabel || 'SIDE B'}
        className="mb-3"
      />

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-[10px] text-[#6b7db3]">
        <div className="flex items-center gap-1">
          <IconChart size={10} className="text-violet-400" />
          <span className="font-mono tracking-wider">{formatSol(market.totalVolume)} SOL</span>
        </div>
        <div className="flex items-center gap-1">
          <IconClock size={10} className="text-yellow-400" />
          <span className="font-mono tracking-wider">{formatCountdown(market.closesAt)}</span>
        </div>
      </div>
    </button>
  );
}
