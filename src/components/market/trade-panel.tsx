'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/cn';
import { IconWallet, IconArrowUp, IconArrowDown } from '@/components/icons';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { Side, calculateOdds, type Market } from '@/types';

interface TradePanelProps {
  market: Market;
}

export function TradePanel({ market }: TradePanelProps) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol } = useWalletBalance();
  const [side, setSide] = useState<Side>(Side.A);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const odds = calculateOdds(market);
  const sideAPercent = (odds.sideABps / 100).toFixed(1);
  const sideBPercent = (odds.sideBBps / 100).toFixed(1);

  const handleTrade = useCallback(async () => {
    if (!connected || !publicKey || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setSubmitting(true);
    try {
      // Transaction will be built and sent via the Anchor program
      console.info(`Bet: side=${side} amount=${parsedAmount} SOL on market ${market.publicKey.toBase58()}`);
    } catch (err) {
      console.error('Bet failed:', err);
    } finally {
      setSubmitting(false);
    }
  }, [connected, publicKey, amount, side, market.publicKey]);

  return (
    <div className="rounded-xl border border-cyan-400/8 bg-[#0f1628]/60 p-5 space-y-5 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-white tracking-widest">PLACE BET</h3>

      {/* Side Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide(Side.A)}
          className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold tracking-wider transition-all',
            side === Side.A
              ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
              : 'bg-[#0a0e1a]/50 text-[#6b7db3] border border-cyan-400/8 hover:border-cyan-400/15',
          )}
        >
          <IconArrowUp size={14} />
          {market.sideALabel || 'SIDE A'} {sideAPercent}%
        </button>
        <button
          onClick={() => setSide(Side.B)}
          className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold tracking-wider transition-all',
            side === Side.B
              ? 'bg-[#e63973]/15 text-[#e63973] border border-[#e63973]/30'
              : 'bg-[#0a0e1a]/50 text-[#6b7db3] border border-cyan-400/8 hover:border-[#e63973]/15',
          )}
        >
          <IconArrowDown size={14} />
          {market.sideBLabel || 'SIDE B'} {sideBPercent}%
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-xs text-[#6b7db3] tracking-wider">AMOUNT (SOL)</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#0a0e1a]/50 border border-cyan-400/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-400/30 transition-colors"
          />
          {connected && (
            <button
              onClick={() => setAmount(Math.max(0, sol - 0.01).toFixed(4))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#6b7db3] hover:text-cyan-400 transition-colors tracking-[0.2em]"
            >
              MAX
            </button>
          )}
        </div>
      </div>

      {/* Action Button */}
      {connected ? (
        <button
          onClick={handleTrade}
          disabled={submitting || !amount || parseFloat(amount) <= 0}
          className={cn(
            'w-full py-3 rounded-lg text-sm font-bold tracking-widest transition-all',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            side === Side.A
              ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#060a14]'
              : 'bg-gradient-to-r from-[#d6295f] to-[#e63973] hover:from-[#e63973] hover:to-[#f04d85] text-white',
          )}
        >
          {submitting ? 'CONFIRMING...' : `BET ON ${side === Side.A ? market.sideALabel || 'SIDE A' : market.sideBLabel || 'SIDE B'}`}
        </button>
      ) : (
        <button
          onClick={() => setVisible(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-sm font-bold tracking-widest transition-all"
        >
          <IconWallet size={14} />
          CONNECT WALLET
        </button>
      )}
    </div>
  );
}
