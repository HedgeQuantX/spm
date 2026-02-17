'use client';

import { useEffect, useCallback } from 'react';
import { useMarketDetail } from '@/hooks/use-market-detail';
import { MarketStats } from './market-stats';
import { TradePanel } from './trade-panel';
import { TradeHistory } from './trade-history';
import { ProbabilityBar } from '@/components/ui/probability-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { MarketDetailSkeleton } from '@/components/ui/skeleton';
import { IconX, IconExternalLink } from '@/components/icons';
import { MARKET_CATEGORIES_LABELS } from '@/config/constants';
import { calculateOdds } from '@/types/market';
import { truncateAddress } from '@/lib/format';
import type { Market } from '@/types';

interface MarketDetailPanelProps {
  market: Market;
  onClose: () => void;
}

export function MarketDetailPanel({ market, onClose }: MarketDetailPanelProps) {
  const address = market.publicKey.toBase58();
  const { market: liveMarket, bets, loading, refresh } = useMarketDetail(address);

  const displayMarket = liveMarket || market;
  const odds = calculateOdds(displayMarket);
  const sideAPercent = odds.sideABps / 100;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#060a14]/70 animate-backdrop-fade"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-lg h-full flex flex-col bg-[#0a0e1a] border-l border-cyan-400/10 animate-slide-in-right">
        {/* Panel Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-cyan-400/10 glass-bar">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[9px] tracking-[0.2em] text-[#6b7db3] font-bold shrink-0">
              {MARKET_CATEGORIES_LABELS[displayMarket.category]}
            </span>
            <StatusBadge status={displayMarket.status} />
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-[#6b7db3] hover:text-white transition-colors"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading && !liveMarket ? (
            <div className="p-4">
              <MarketDetailSkeleton />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug mb-1">
                  {displayMarket.title}
                </h2>
                <p className="text-[10px] text-[#6b7db3] tracking-wider leading-relaxed normal-case">
                  {displayMarket.description}
                </p>
              </div>

              {/* Creator */}
              <div className="flex items-center gap-1.5 text-[10px] text-[#4a5a8a]">
                <span className="tracking-wider">CREATED BY</span>
                <a
                  href={`https://solscan.io/account/${displayMarket.creator.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#8b9ed3] hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  {truncateAddress(displayMarket.creator.toBase58())}
                  <IconExternalLink size={8} />
                </a>
              </div>

              {/* Probability */}
              <ProbabilityBar
                sideAPercent={sideAPercent}
                sideALabel={displayMarket.sideALabel || 'SIDE A'}
                sideBLabel={displayMarket.sideBLabel || 'SIDE B'}
              />

              {/* Stats */}
              <MarketStats market={displayMarket} />

              {/* Trade Panel */}
              <TradePanel market={displayMarket} onBetPlaced={refresh} />

              {/* Trade History */}
              <TradeHistory bets={bets} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
