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
  IconExternalLink,
} from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Side, type Bet } from '@/types';

export default function PortfolioPage() {
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
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <IconBriefcase size={32} className="text-[#6b7db3] mb-4" />
          <h2 className="text-lg font-bold text-white mb-2 tracking-widest">
            CONNECT YOUR WALLET
          </h2>
          <p className="text-sm text-[#6b7db3] mb-6 tracking-wider">
            VIEW YOUR BETS AND POSITIONS
          </p>
          <button
            onClick={() => setVisible(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-sm font-bold tracking-widest transition-all"
          >
            <IconWallet size={14} />
            CONNECT WALLET
          </button>
        </div>
      </div>
    );
  }

  const totalBetVolume = bets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <IconBriefcase size={24} className="text-violet-400" />
        <h1 className="text-2xl font-bold text-white tracking-widest">PORTFOLIO</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-4">
          <p className="text-[10px] tracking-[0.15em] text-[#6b7db3] mb-1">SOL BALANCE</p>
          <div className="flex items-center gap-2">
            <IconSolana size={14} className="text-cyan-400" />
            <span className="font-mono font-semibold text-white">{sol.toFixed(4)}</span>
          </div>
        </div>
        <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-4">
          <p className="text-[10px] tracking-[0.15em] text-[#6b7db3] mb-1">TOTAL BETS</p>
          <span className="font-mono font-semibold text-white">{bets.length}</span>
        </div>
        <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-4">
          <p className="text-[10px] tracking-[0.15em] text-[#6b7db3] mb-1">BET VOLUME</p>
          <span className="font-mono font-semibold text-white">{formatSol(totalBetVolume)} SOL</span>
        </div>
      </div>

      {/* Bets Table */}
      <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-cyan-400/8">
          <h3 className="text-sm font-bold text-white tracking-widest">YOUR BETS</h3>
        </div>

        <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] tracking-[0.15em] text-[#6b7db3] border-b border-cyan-400/5">
          <span>MARKET</span>
          <span>SIDE</span>
          <span className="text-right">AMOUNT</span>
          <span className="text-right">STATUS</span>
          <span className="text-right">TIME</span>
        </div>

        {loading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && bets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#6b7db3] text-sm tracking-wider">NO BETS YET</p>
            <p className="text-[#4a5a8a] text-xs mt-1 tracking-wider">
              PLACE A BET ON A MARKET TO SEE IT HERE
            </p>
          </div>
        )}

        {bets.map((bet) => (
          <div
            key={bet.publicKey.toBase58()}
            className="grid grid-cols-5 gap-4 px-5 py-3 text-sm border-b border-cyan-400/5 hover:bg-cyan-400/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#8b9ed3] truncate">
                {truncateAddress(bet.market.toBase58())}
              </span>
              <a
                href={`/market/${bet.market.toBase58()}`}
                className="text-[#4a5a8a] hover:text-cyan-400 transition-colors"
              >
                <IconExternalLink size={10} />
              </a>
            </div>
            <span className={cn(
              'font-bold text-xs tracking-wider',
              bet.side === Side.A ? 'text-cyan-400' : 'text-[#e63973]',
            )}>
              {bet.side === Side.A ? 'SIDE A' : 'SIDE B'}
            </span>
            <span className="text-right font-mono text-xs text-white">
              {formatSol(bet.amount)} SOL
            </span>
            <span className={cn(
              'text-right text-xs font-bold tracking-wider',
              bet.claimed ? 'text-cyan-400' : bet.refunded ? 'text-yellow-400' : 'text-[#6b7db3]',
            )}>
              {bet.claimed ? 'CLAIMED' : bet.refunded ? 'REFUNDED' : 'PENDING'}
            </span>
            <span className="text-right font-mono text-xs text-[#6b7db3]">
              {formatTimeAgo(bet.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
