'use client';

import { cn } from '@/lib/cn';
import { truncateAddress, formatAmount, formatTimeAgo } from '@/lib/format';
import { IconExternalLink } from '@/components/icons';
import { OutcomeSide, type MarketTrade } from '@/types';

interface TradeHistoryProps {
  trades: MarketTrade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Trades</h3>
        <p className="text-xs text-zinc-500 text-center py-6">No trades yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Recent Trades</h3>
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 text-[10px] uppercase tracking-wider text-zinc-600 px-2 py-1">
          <span>Trader</span>
          <span>Side</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>

        {/* Rows */}
        {trades.map((trade) => (
          <div
            key={trade.signature}
            className="grid grid-cols-4 gap-2 text-xs px-2 py-2 rounded-lg hover:bg-zinc-800/30 transition-colors group"
          >
            <span className="font-mono text-zinc-400">
              {truncateAddress(trade.trader.toBase58())}
            </span>
            <span
              className={cn(
                'font-medium',
                trade.side === OutcomeSide.Yes
                  ? 'text-emerald-400'
                  : 'text-rose-400',
              )}
            >
              {trade.side === OutcomeSide.Yes ? 'Yes' : 'No'}
            </span>
            <span className="text-right font-mono text-white">
              {formatAmount(trade.amount)}
            </span>
            <div className="flex items-center justify-end gap-1">
              <span className="text-zinc-500 font-mono">
                {formatTimeAgo(trade.timestamp)}
              </span>
              <a
                href={`https://solscan.io/tx/${trade.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all"
              >
                <IconExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
