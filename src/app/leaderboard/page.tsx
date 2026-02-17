'use client';

import { useState, useEffect } from 'react';
import { getConnection } from '@/services/solana.service';
import { IconTrophy, IconExternalLink } from '@/components/icons';
import { truncateAddress, formatAmount, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Fetch leaderboard data from on-chain program accounts
        // This will be populated when the program is deployed
        const connection = getConnection();
        const slot = await connection.getSlot();
        // Program accounts will be fetched and ranked here
        console.info('Current slot:', slot);
        setEntries([]);
      } catch {
        /* connection error */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <IconTrophy size={24} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
      </div>

      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] uppercase tracking-wider text-zinc-600 border-b border-zinc-800/50">
          <span>Rank</span>
          <span>Trader</span>
          <span className="text-right">PnL</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Win Rate</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && entries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No leaderboard data yet</p>
            <p className="text-zinc-600 text-xs mt-1">
              Start trading to appear on the leaderboard
            </p>
          </div>
        )}

        {/* Rows */}
        {entries.map((entry) => (
          <div
            key={entry.wallet.toBase58()}
            className={cn(
              'grid grid-cols-5 gap-4 px-5 py-3 text-sm border-b border-zinc-800/30',
              'hover:bg-zinc-800/20 transition-colors',
            )}
          >
            <span className={cn(
              'font-mono font-bold',
              entry.rank <= 3 ? 'text-amber-400' : 'text-zinc-500',
            )}>
              #{entry.rank}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-300">
                {truncateAddress(entry.wallet.toBase58())}
              </span>
              <a
                href={`https://solscan.io/account/${entry.wallet.toBase58()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <IconExternalLink size={10} />
              </a>
            </div>
            <span className={cn(
              'text-right font-mono',
              entry.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400',
            )}>
              {entry.totalPnl >= 0 ? '+' : ''}{formatAmount(entry.totalPnl)}
            </span>
            <span className="text-right font-mono text-zinc-400">
              ${formatAmount(entry.totalVolume)}
            </span>
            <span className="text-right font-mono text-zinc-400">
              {formatPercent(entry.winRate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
