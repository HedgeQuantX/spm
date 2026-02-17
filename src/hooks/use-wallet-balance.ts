'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ENV } from '@/config/env';
import type { WalletBalance } from '@/types';

export function useWalletBalance(): WalletBalance & { refresh: () => void } {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [sol, setSol] = useState(0);
  const [usdc, setUsdc] = useState(0);

  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      setSol(0);
      setUsdc(0);
      return;
    }

    try {
      const [solBalance, tokenAccounts] = await Promise.all([
        connection.getBalance(publicKey),
        connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: new PublicKey(ENV.USDC_MINT),
        }),
      ]);

      setSol(solBalance / LAMPORTS_PER_SOL);

      if (tokenAccounts.value.length > 0) {
        const parsed = tokenAccounts.value[0].account.data.parsed;
        setUsdc(parsed.info.tokenAmount.uiAmount ?? 0);
      } else {
        setUsdc(0);
      }
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

  return { sol, usdc, refresh: fetchBalances };
}
