'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { cn } from '@/lib/cn';
import { formatAmount, formatPercent, formatPnl } from '@/lib/format';
import {
  IconBriefcase,
  IconWallet,
  IconSolana,
  IconExternalLink,
} from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { OutcomeSide, type MarketPosition } from '@/types';

export default function PortfolioPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol, usdc } = useWalletBalance();
  const [positions, setPositions] = useState<MarketPosition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setPositions([]);
      return;
    }

    async function loadPositions() {
      setLoading(true);
      try {
        // Fetch user positions from on-chain program accounts
        // Will be populated when program is deployed
        setPositions([]);
      } catch {
        /* connection error */
      } finally {
        setLoading(false);
      }
    }

    loadPositions();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <IconBriefcase size={32} className="text-zinc-600 mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">
            Connect your wallet
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            View your positions and trading history
          </p>
          <button
            onClick={() => setVisible(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all"
          >
            <IconWallet size={14} />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <IconBriefcase size={24} className="text-violet-400" />
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">SOL Balance</p>
          <div className="flex items-center gap-2">
            <IconSolana size={14} />
            <span className="font-mono font-semibold text-white">{sol.toFixed(4)}</span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">USDC Balance</p>
          <span className="font-mono font-semibold text-white">${usdc.toFixed(2)}</span>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Positions Value</p>
          <span className="font-mono font-semibold text-white">${formatAmount(totalValue)}</span>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Total PnL</p>
          <span className={cn(
            'font-mono font-semibold',
            totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400',
          )}>
            {formatPnl(totalPnl)}
          </span>
        </div>
      </div>

      {/* Positions Table */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800/50">
          <h3 className="text-sm font-semibold text-white">Open Positions</h3>
        </div>

        <div className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] uppercase tracking-wider text-zinc-600 border-b border-zinc-800/30">
          <span className="col-span-2">Market</span>
          <span>Side</span>
          <span className="text-right">Shares</span>
          <span className="text-right">Price</span>
          <span className="text-right">PnL</span>
        </div>

        {loading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && positions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No open positions</p>
            <p className="text-zinc-600 text-xs mt-1">
              Start trading to see your positions here
            </p>
          </div>
        )}

        {positions.map((pos, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 px-5 py-3 text-sm border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors"
          >
            <div className="col-span-2 flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-400 truncate">
                {pos.market.toBase58().slice(0, 12)}...
              </span>
              <a
                href={`/market/${pos.market.toBase58()}`}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <IconExternalLink size={10} />
              </a>
            </div>
            <span className={cn(
              'font-medium text-xs',
              pos.side === OutcomeSide.Yes ? 'text-emerald-400' : 'text-rose-400',
            )}>
              {pos.side === OutcomeSide.Yes ? 'Yes' : 'No'}
            </span>
            <span className="text-right font-mono text-xs text-zinc-300">
              {pos.shares.toFixed(2)}
            </span>
            <span className="text-right font-mono text-xs text-zinc-300">
              ${pos.currentPrice.toFixed(4)}
            </span>
            <span className={cn(
              'text-right font-mono text-xs',
              pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400',
            )}>
              {formatPnl(pos.pnl)} ({formatPercent(pos.pnlPercent)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
