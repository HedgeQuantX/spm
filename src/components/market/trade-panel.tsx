'use client';

import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/cn';
import { IconWallet, IconArrowUp, IconArrowDown, IconCheck, IconX } from '@/components/icons';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { buildPlaceBetTx, sendAndConfirm } from '@/services/program.service';
import { Side, calculateOdds, type Market } from '@/types';

interface TradePanelProps {
  market: Market;
  onBetPlaced?: () => void;
}

type TxStatus = 'idle' | 'building' | 'signing' | 'confirming' | 'success' | 'error';

export function TradePanel({ market, onBetPlaced }: TradePanelProps) {
  const { connected, publicKey, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol, refresh: refreshBalance } = useWalletBalance();
  const [side, setSide] = useState<Side>(Side.A);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TxStatus>('idle');
  const [txSig, setTxSig] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const odds = calculateOdds(market);
  const sideAPercent = (odds.sideABps / 100).toFixed(1);
  const sideBPercent = (odds.sideBBps / 100).toFixed(1);

  const handleTrade = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (parsedAmount > sol) {
      setErrorMsg('INSUFFICIENT BALANCE');
      setStatus('error');
      return;
    }

    setStatus('building');
    setErrorMsg(null);
    setTxSig(null);

    try {
      // Build the transaction
      const sideNum = side === Side.A ? 0 : 1;
      const tx = await buildPlaceBetTx({
        bettor: publicKey,
        marketPda: market.publicKey,
        marketIndex: market.marketIndex,
        totalBets: market.totalBets,
        side: sideNum,
        amountSol: parsedAmount,
      });

      // Sign via wallet
      setStatus('signing');
      const signed = await signTransaction(tx);

      // Send and confirm
      setStatus('confirming');
      const sig = await sendAndConfirm(signed);

      setTxSig(sig);
      setStatus('success');
      setAmount('');
      refreshBalance();

      if (onBetPlaced) onBetPlaced();

      // Reset to idle after 5s
      setTimeout(() => {
        setStatus('idle');
        setTxSig(null);
      }, 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'TRANSACTION FAILED';
      // Clean up common error messages
      if (msg.includes('User rejected')) {
        setErrorMsg('TRANSACTION CANCELLED');
      } else if (msg.includes('insufficient')) {
        setErrorMsg('INSUFFICIENT BALANCE');
      } else if (msg.includes('0x1')) {
        setErrorMsg('INSUFFICIENT FUNDS FOR RENT');
      } else {
        setErrorMsg(msg.slice(0, 80).toUpperCase());
      }
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }, [connected, publicKey, signTransaction, amount, side, market, sol, refreshBalance, onBetPlaced]);

  const isSubmitting = status === 'building' || status === 'signing' || status === 'confirming';

  const statusLabel = {
    building: 'BUILDING TX...',
    signing: 'SIGN IN WALLET...',
    confirming: 'CONFIRMING...',
    success: 'BET PLACED',
    error: errorMsg || 'ERROR',
    idle: `BET ON ${side === Side.A ? market.sideALabel || 'SIDE A' : market.sideBLabel || 'SIDE B'}`,
  }[status];

  return (
    <div className="border border-cyan-400/8 bg-[#0f1628]/60 p-4 space-y-4 backdrop-blur-sm">
      <h3 className="text-[11px] font-bold text-white tracking-[0.15em]">PLACE BET</h3>

      {/* Side Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide(Side.A)}
          disabled={isSubmitting}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold tracking-wider transition-all',
            side === Side.A
              ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
              : 'bg-[#0a0e1a]/50 text-[#6b7db3] border border-cyan-400/8 hover:border-cyan-400/15',
          )}
        >
          <IconArrowUp size={12} />
          {market.sideALabel || 'SIDE A'} {sideAPercent}%
        </button>
        <button
          onClick={() => setSide(Side.B)}
          disabled={isSubmitting}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold tracking-wider transition-all',
            side === Side.B
              ? 'bg-[#e63973]/15 text-[#e63973] border border-[#e63973]/30'
              : 'bg-[#0a0e1a]/50 text-[#6b7db3] border border-cyan-400/8 hover:border-[#e63973]/15',
          )}
        >
          <IconArrowDown size={12} />
          {market.sideBLabel || 'SIDE B'} {sideBPercent}%
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-[#6b7db3] tracking-wider">AMOUNT (SOL)</label>
          {connected && (
            <span className="text-[10px] font-mono text-[#4a5a8a]">
              BAL: {sol.toFixed(4)}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2.5 bg-[#0a0e1a]/50 border border-cyan-400/10 text-white font-mono text-[12px] focus:outline-none focus:border-cyan-400/30 transition-colors disabled:opacity-50"
          />
          {connected && (
            <button
              onClick={() => setAmount(Math.max(0, sol - 0.01).toFixed(4))}
              disabled={isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#6b7db3] hover:text-cyan-400 transition-colors tracking-[0.2em]"
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
          disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          className={cn(
            'w-full py-2.5 text-[11px] font-bold tracking-[0.12em] transition-all flex items-center justify-center gap-1.5',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            status === 'success'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
              : status === 'error'
              ? 'bg-[#e63973]/20 text-[#e63973] border border-[#e63973]/30'
              : side === Side.A
              ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#060a14]'
              : 'bg-gradient-to-r from-[#d6295f] to-[#e63973] hover:from-[#e63973] hover:to-[#f04d85] text-white',
          )}
        >
          {status === 'success' && <IconCheck size={12} />}
          {status === 'error' && <IconX size={12} />}
          {statusLabel}
        </button>
      ) : (
        <button
          onClick={() => setVisible(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-[11px] font-bold tracking-[0.12em] transition-all"
        >
          <IconWallet size={12} />
          CONNECT WALLET
        </button>
      )}

      {/* Tx signature link */}
      {txSig && (
        <a
          href={`https://solscan.io/tx/${txSig}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-[9px] font-mono text-cyan-400/60 hover:text-cyan-400 transition-colors tracking-wider"
        >
          VIEW TX ON SOLSCAN
        </a>
      )}
    </div>
  );
}
