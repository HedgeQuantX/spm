'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { WalletBalance } from '@/types';

export function useWalletBalance(): WalletBalance & { refresh: () => void } {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [sol, setSol] = useState(0);

  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      setSol(0);
      return;
    }

    try {
      const solBalance = await connection.getBalance(publicKey);
      setSol(solBalance / LAMPORTS_PER_SOL);
    } catch {
      /* connection error, keep previous values */
    }
  }, [publicKey, connection]);

  useEffect(() => {
    fetchBalances();

    if (!publicKey) return;

    const subId = connection.onAccountChange(publicKey, () => {
      fetchBalances();
    });

    return () => {
      connection.removeAccountChangeListener(subId);
    };
  }, [publicKey, connection, fetchBalances]);

  return { sol, refresh: fetchBalances };
}
