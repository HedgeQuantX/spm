'use client';

import { cn } from '@/lib/cn';
import { truncateAddress, formatSol, formatTimeAgo } from '@/lib/format';
import { IconExternalLink } from '@/components/icons';
import { Side, type Bet } from '@/types';

interface TradeHistoryProps {
  bets: Bet[];
}

export function TradeHistory({ bets }: TradeHistoryProps) {
  if (bets.length === 0) {
    return (
      <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-5">
        <h3 className="text-sm font-bold text-white mb-3 tracking-widest">RECENT BETS</h3>
        <p className="text-xs text-[#6b7db3] text-center py-6 tracking-wider">NO BETS YET</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-5">
      <h3 className="text-sm font-bold text-white mb-3 tracking-widest">RECENT BETS</h3>
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 text-[10px] tracking-[0.15em] text-[#6b7db3] px-2 py-1">
          <span>BETTOR</span>
          <span>SIDE</span>
          <span className="text-right">AMOUNT</span>
          <span className="text-right">TIME</span>
        </div>

        {/* Rows */}
        {bets.map((bet) => (
          <div
            key={bet.publicKey.toBase58()}
            className="grid grid-cols-4 gap-2 text-xs px-2 py-2 rounded-lg hover:bg-cyan-400/5 transition-colors group"
          >
            <span className="font-mono text-[#8b9ed3]">
              {truncateAddress(bet.bettor.toBase58())}
            </span>
            <span
              className={cn(
                'font-bold tracking-wider',
                bet.side === Side.A ? 'text-cyan-400' : 'text-[#e63973]',
              )}
            >
              {bet.side === Side.A ? 'SIDE A' : 'SIDE B'}
            </span>
            <span className="text-right font-mono text-white">
              {formatSol(bet.amount)} SOL
            </span>
            <div className="flex items-center justify-end gap-1">
              <span className="text-[#6b7db3] font-mono">
                {formatTimeAgo(bet.createdAt)}
              </span>
              <a
                href={`https://solscan.io/account/${bet.publicKey.toBase58()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 text-[#6b7db3] hover:text-cyan-400 transition-all"
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
