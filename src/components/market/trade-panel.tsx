'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/cn';
import { formatPercent } from '@/lib/format';
import { IconWallet, IconArrowUp, IconArrowDown } from '@/components/icons';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { OutcomeSide, type Market } from '@/types';

interface TradePanelProps {
  market: Market;
}

export function TradePanel({ market }: TradePanelProps) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol } = useWalletBalance();
  const [side, setSide] = useState<OutcomeSide>(OutcomeSide.Yes);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedOutcome = market.outcomes[side === OutcomeSide.Yes ? 0 : 1];
  const estimatedShares = amount ? parseFloat(amount) / selectedOutcome.probability : 0;

  const handleTrade = useCallback(async () => {
    if (!connected || !publicKey || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setSubmitting(true);
    try {
      // Transaction will be built and sent via the Solana program
      // This requires the program to be deployed and the instruction
      // to be constructed based on the program's IDL
      console.info(`Trade: ${side} ${parsedAmount} SOL on ${market.publicKey.toBase58()}`);
    } catch (err) {
      console.error('Trade failed:', err);
    } finally {
      setSubmitting(false);
    }
  }, [connected, publicKey, amount, side, market.publicKey]);

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5 space-y-5">
      <h3 className="text-sm font-semibold text-white">Place Trade</h3>

      {/* Side Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide(OutcomeSide.Yes)}
          className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all',
            side === OutcomeSide.Yes
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-zinc-800/30 text-zinc-500 border border-zinc-800/50 hover:border-zinc-700',
          )}
        >
          <IconArrowUp size={14} />
          Yes {formatPercent(market.outcomes[0].probability)}
        </button>
        <button
          onClick={() => setSide(OutcomeSide.No)}
          className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all',
            side === OutcomeSide.No
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-zinc-800/30 text-zinc-500 border border-zinc-800/50 hover:border-zinc-700',
          )}
        >
          <IconArrowDown size={14} />
          No {formatPercent(market.outcomes[1].probability)}
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">Amount (SOL)</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 text-white font-mono text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
          {connected && (
            <button
              onClick={() => setAmount(Math.max(0, sol - 0.01).toFixed(4))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              Max
            </button>
          )}
        </div>
      </div>

      {/* Estimate */}
      {amount && parseFloat(amount) > 0 && (
        <div className="flex justify-between text-xs text-zinc-500 font-mono">
          <span>Est. shares</span>
          <span className="text-white">{estimatedShares.toFixed(2)}</span>
        </div>
      )}

      {/* Action Button */}
      {connected ? (
        <button
          onClick={handleTrade}
          disabled={submitting || !amount || parseFloat(amount) <= 0}
          className={cn(
            'w-full py-3 rounded-lg text-sm font-semibold transition-all',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            side === OutcomeSide.Yes
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
              : 'bg-rose-500 hover:bg-rose-400 text-white',
          )}
        >
          {submitting ? 'Confirming...' : `Buy ${side === OutcomeSide.Yes ? 'Yes' : 'No'}`}
        </button>
      ) : (
        <button
          onClick={() => setVisible(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all"
        >
          <IconWallet size={14} />
          Connect Wallet
        </button>
      )}
    </div>
  );
}
