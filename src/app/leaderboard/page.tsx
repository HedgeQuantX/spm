'use client';

import { useState, useEffect } from 'react';
import { IconTrophy, IconExternalLink } from '@/components/icons';
import { truncateAddress, formatSol } from '@/lib/format';
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
        // Fetch UserStats accounts from on-chain program
        // Will be populated when program is deployed and users have stats
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
        <IconTrophy size={24} className="text-yellow-400" />
        <h1 className="text-2xl font-bold text-white tracking-widest">LEADERBOARD</h1>
      </div>

      <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] tracking-[0.15em] text-[#6b7db3] border-b border-cyan-400/8">
          <span>RANK</span>
          <span>TRADER</span>
          <span className="text-right">PNL</span>
          <span className="text-right">VOLUME</span>
          <span className="text-right">WIN RATE</span>
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
            <p className="text-[#6b7db3] text-sm tracking-wider">NO LEADERBOARD DATA YET</p>
            <p className="text-[#4a5a8a] text-xs mt-1 tracking-wider">
              START TRADING TO APPEAR ON THE LEADERBOARD
            </p>
          </div>
        )}

        {/* Rows */}
        {entries.map((entry) => (
          <div
            key={entry.wallet.toBase58()}
            className={cn(
              'grid grid-cols-5 gap-4 px-5 py-3 text-sm border-b border-cyan-400/5',
              'hover:bg-cyan-400/5 transition-colors',
            )}
          >
            <span className={cn(
              'font-mono font-bold',
              entry.rank <= 3 ? 'text-yellow-400' : 'text-[#6b7db3]',
            )}>
              #{entry.rank}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#8b9ed3]">
                {truncateAddress(entry.wallet.toBase58())}
              </span>
              <a
                href={`https://solscan.io/account/${entry.wallet.toBase58()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a5a8a] hover:text-cyan-400 transition-colors"
              >
                <IconExternalLink size={10} />
              </a>
            </div>
            <span className={cn(
              'text-right font-mono',
              entry.totalPnl >= 0 ? 'text-cyan-400' : 'text-[#e63973]',
            )}>
              {entry.totalPnl >= 0 ? '+' : ''}{formatSol(entry.totalPnl)} SOL
            </span>
            <span className="text-right font-mono text-[#8b9ed3]">
              {formatSol(entry.totalVolume)} SOL
            </span>
            <span className="text-right font-mono text-[#8b9ed3]">
              {entry.winRate.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
