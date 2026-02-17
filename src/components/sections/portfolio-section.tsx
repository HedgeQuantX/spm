'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { fetchUserBets } from '@/services/market.service';
import { cn } from '@/lib/cn';
import { formatSol, truncateAddress, formatTimeAgo } from '@/lib/format';
import {
  IconBriefcase,
  IconWallet,
  IconSolana,
} from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Side, type Bet } from '@/types';

export function PortfolioSection() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol } = useWalletBalance();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBets([]);
      return;
    }

    async function loadBets() {
      if (!publicKey) return;
      setLoading(true);
      try {
        const userBets = await fetchUserBets(publicKey);
        setBets(userBets);
      } catch {
        /* connection error */
      } finally {
        setLoading(false);
      }
    }

    loadBets();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <IconBriefcase size={28} className="text-[#6b7db3]" />
        <h2 className="text-sm font-bold text-white tracking-[0.12em]">
          CONNECT YOUR WALLET
        </h2>
        <p className="text-[10px] text-[#6b7db3] tracking-wider">
          VIEW YOUR BETS AND POSITIONS
        </p>
        <button
          onClick={() => setVisible(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-[11px] font-bold tracking-[0.12em] transition-all mt-2"
        >
          <IconWallet size={12} />
          CONNECT WALLET
        </button>
      </div>
    );
  }

  const totalBetVolume = bets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Stats Bar */}
      <div className="shrink-0 px-3 sm:px-5 py-2.5 border-b border-cyan-400/5">
        <div className="flex items-center gap-2 mb-2">
          <IconBriefcase size={14} className="text-violet-400" />
          <h2 className="text-sm font-bold text-white tracking-[0.12em]">PORTFOLIO</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-cyan-400/8 bg-[#0f1628]/60 p-2.5">
            <p className="text-[9px] tracking-[0.15em] text-[#6b7db3] mb-0.5">SOL BALANCE</p>
            <div className="flex items-center gap-1.5">
              <IconSolana size={11} className="text-cyan-400" />
              <span className="font-mono font-semibold text-white text-xs">{sol.toFixed(4)}</span>
            </div>
          </div>
          <div className="border border-cyan-400/8 bg-[#0f1628]/60 p-2.5">
            <p className="text-[9px] tracking-[0.15em] text-[#6b7db3] mb-0.5">TOTAL BETS</p>
            <span className="font-mono font-semibold text-white text-xs">{bets.length}</span>
          </div>
          <div className="border border-cyan-400/8 bg-[#0f1628]/60 p-2.5">
            <p className="text-[9px] tracking-[0.15em] text-[#6b7db3] mb-0.5">BET VOLUME</p>
            <span className="font-mono font-semibold text-white text-xs">{formatSol(totalBetVolume)} SOL</span>
          </div>
        </div>
      </div>

      {/* Bets Table — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-3 px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] tracking-[0.15em] text-[#6b7db3] border-b border-cyan-400/8 sticky top-0 glass-bar z-10">
          <span>MARKET</span>
          <span>SIDE</span>
          <span className="text-right">AMOUNT</span>
          <span className="text-right">STATUS</span>
          <span className="text-right">TIME</span>
        </div>

        {loading && (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}

        {!loading && bets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#6b7db3] text-xs tracking-wider">NO BETS YET</p>
            <p className="text-[#4a5a8a] text-[10px] mt-1 tracking-wider">
              PLACE A BET ON A MARKET TO SEE IT HERE
            </p>
          </div>
        )}

        {bets.map((bet) => (
          <div
            key={bet.publicKey.toBase58()}
            className="grid grid-cols-5 gap-3 px-3 sm:px-5 py-2.5 text-[11px] border-b border-cyan-400/5 hover:bg-cyan-400/5 transition-colors"
          >
            <span className="font-mono text-[10px] text-[#8b9ed3] truncate">
              {truncateAddress(bet.market.toBase58())}
            </span>
            <span className={cn(
              'font-bold text-[10px] tracking-wider',
              bet.side === Side.A ? 'text-cyan-400' : 'text-[#e63973]',
            )}>
              {bet.side === Side.A ? 'SIDE A' : 'SIDE B'}
            </span>
            <span className="text-right font-mono text-[10px] text-white">
              {formatSol(bet.amount)} SOL
            </span>
            <span className={cn(
              'text-right text-[10px] font-bold tracking-wider',
              bet.claimed ? 'text-cyan-400' : bet.refunded ? 'text-yellow-400' : 'text-[#6b7db3]',
            )}>
              {bet.claimed ? 'CLAIMED' : bet.refunded ? 'REFUNDED' : 'PENDING'}
            </span>
            <span className="text-right font-mono text-[10px] text-[#6b7db3]">
              {formatTimeAgo(bet.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
